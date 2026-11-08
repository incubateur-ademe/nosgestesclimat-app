import type Engine from 'publicodes'
import type { RawPublicodes } from 'publicodes'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { transaction } from '../../../../lib/transaction.ts'
import { prisma } from '../../../../prisma/client.ts'
import { emptyDatabase } from '../../../../test-utils/empty-database.ts'
import { createTestLogger } from '../../../../test-utils/logger.ts'
import { ActionAssessmentPublicodesError } from '../../../actions/errors/action-assessment.error.ts'
import { actionFactory } from '../../../actions/factories/action.factory.ts'
import { serializeModel } from '../../../models/helpers/model-versions.ts'
import {
  createResolvePublicRules,
  type ResolvePublicRules,
} from '../../../rules/services/resolve-public-rules.service.ts'
import { createTestEngine } from '../../../simulation-computation/factories/engine.factory.ts'
import { simulationFactory } from '../../factories/simulation.factory.ts'
import type { Simulation } from '../../types/simulation.ts'
import { createEvaluateSimulation } from '../evaluate-simulation.service.ts'

const logger = createTestLogger()
const evaluateSimulation = createEvaluateSimulation({ logger })

/**
 * Required by any rule evaluated for a metric: the evaluation sets it in its
 * context. Copied from the model.
 */
const METRIC_RULE: RawPublicodes<string> = {
  métrique: {
    avec: { carbone: null, eau: null },
    'une possibilité': ['carbone', 'eau'],
    'par défaut': "'carbone'",
  },
}

const APPLICABLE_RULE_ID = '00000000-0000-0000-0000-000000000001'
const NOT_APPLICABLE_RULE_ID = '00000000-0000-0000-0000-000000000002'
const BOOLEAN_RULE_ID = '00000000-0000-0000-0000-000000000004'

const testRules: RawPublicodes<string> = {
  'test . applicable': {
    valeur: 42,
    unité: 'kgCO2e',
    titre: 'Test applicable',
    meta: { id: APPLICABLE_RULE_ID },
  },
  'test . not-applicable': {
    'est non applicable': 'oui',
    titre: 'Test not applicable',
    meta: { id: NOT_APPLICABLE_RULE_ID },
  },
  'test . boolean': {
    valeur: 'oui',
    titre: 'Test boolean',
    meta: { id: BOOLEAN_RULE_ID },
  },
}

describe('evaluateSimulation', () => {
  const engine = createTestEngine(testRules)

  let simulation: Simulation
  let resolvePublicRules: ResolvePublicRules

  /**
   * Evaluates like the worker does: the public rules are resolved first, their
   * `Rule` rows committed on their own, then the simulation is evaluated
   * inside a transaction. PGlite has a single connection, so a write that
   * bypasses the session would hang the test.
   */
  const evaluate = async (
    withEngine: Engine = engine,
    {
      evaluated = simulation,
      resolve = resolvePublicRules,
    }: { evaluated?: Simulation; resolve?: ResolvePublicRules } = {}
  ) => {
    const publicRules = await resolve(withEngine, evaluated.model)
    return transaction((session) =>
      evaluateSimulation(
        withEngine,
        { id: evaluated.id, model: serializeModel(evaluated.model) },
        { session, publicRules }
      )
    )
  }

  beforeEach(async () => {
    simulation = await simulationFactory.completed().create()
    resolvePublicRules = createResolvePublicRules()
  })

  afterEach(async () => {
    vi.restoreAllMocks()
    await emptyDatabase(prisma)
  })

  describe('action assessments', () => {
    it('stores applicable and non-applicable action assessments', async () => {
      const [applicableAction, notApplicableAction] = await Promise.all([
        actionFactory
          .params({ ruleId: APPLICABLE_RULE_ID })
          .published()
          .create(),
        actionFactory
          .params({ ruleId: NOT_APPLICABLE_RULE_ID })
          .published()
          .create(),
      ])

      await evaluate()

      const assessments = await prisma.actionAssessment.findMany({
        where: { simulationId: simulation.id },
      })

      expect(assessments).toHaveLength(2)

      const applicableAssessment = assessments.find(
        (a) => a.actionId === applicableAction.id
      )!
      expect(applicableAssessment.applicable).toBe(true)
      expect(applicableAssessment.impact).toBe(42)

      const notApplicableAssessment = assessments.find(
        (a) => a.actionId === notApplicableAction.id
      )!
      expect(notApplicableAssessment.applicable).toBe(false)
      expect(notApplicableAssessment.impact).toBeNull()
    })

    it('skips actions whose ruleId is not found in the engine', async () => {
      await actionFactory
        .params({ ruleId: '00000000-0000-0000-0000-ffffffffffff' })
        .published()
        .create()

      await evaluate()

      const assessments = await prisma.actionAssessment.findMany({
        where: { simulationId: simulation.id },
      })

      expect(assessments).toHaveLength(0)
    })

    it('skips actions whose rule evaluation throws', async () => {
      await actionFactory
        .params({ ruleId: APPLICABLE_RULE_ID })
        .published()
        .create()

      vi.spyOn(engine, 'evaluate').mockImplementation(() => {
        throw new Error('Engine evaluation failed')
      })

      await evaluate()

      const assessments = await prisma.actionAssessment.findMany({
        where: { simulationId: simulation.id },
      })
      expect(assessments).toHaveLength(0)

      // The assessment is dropped, not skipped and forgotten: the failure is
      // reported.
      expect(logger.error).toHaveBeenCalledWith(expect.any(Error), {
        actionId: expect.any(String),
        ruleId: APPLICABLE_RULE_ID,
        dottedName: 'test . applicable',
      })
    })

    it('skips actions whose nodeValue is an unexpected type', async () => {
      await actionFactory
        .params({ ruleId: BOOLEAN_RULE_ID })
        .published()
        .create()

      await evaluate()

      const assessments = await prisma.actionAssessment.findMany({
        where: { simulationId: simulation.id },
      })
      expect(assessments).toHaveLength(0)

      // Detected, not thrown: no `Error` to report, so the line names the shape
      // and the failure stays an anomaly to watch by rate.
      expect(logger.warn).toHaveBeenCalledWith(
        'Unexpected nodeValue: boolean',
        expect.objectContaining({ ruleId: BOOLEAN_RULE_ID })
      )
    })

    describe('throws ActionAssessmentPublicodesError', () => {
      it('when there are no actions in database', async () => {
        await expect(evaluate()).rejects.toThrow(
          ActionAssessmentPublicodesError
        )
      })

      it('when no publicodes rules have meta.id', async () => {
        const engineWithoutMeta = createTestEngine({
          'test . no-meta': { valeur: 42 },
        })

        await actionFactory
          .params({ ruleId: APPLICABLE_RULE_ID })
          .published()
          .create()

        await expect(evaluate(engineWithoutMeta)).rejects.toThrow(
          ActionAssessmentPublicodesError
        )
      })
    })
  })

  describe('public rule evaluations', () => {
    /** An engine with the given rules, next to the ones actions need. */
    const engineWith = (rules: RawPublicodes<string>) =>
      createTestEngine({ ...testRules, ...METRIC_RULE, ...rules })

    const findRuleEvaluations = async (simulationId = simulation.id) => {
      const rows = await prisma.ruleEvaluation.findMany({
        where: { simulationId },
        include: { rule: true },
        orderBy: [{ rule: { name: 'asc' } }, { rule: { metric: 'asc' } }],
      })
      return rows.map(({ rule, applicable, valueNumber }) => ({
        name: rule.name,
        metric: rule.metric,
        applicable,
        valueNumber,
      }))
    }

    beforeEach(async () => {
      // Evaluating a simulation assesses actions too, which needs at least one.
      await actionFactory
        .params({ ruleId: APPLICABLE_RULE_ID })
        .published()
        .create()
    })

    it('stores each public rule with a numeric value as applicable, 0 included', async () => {
      await evaluate(
        engineWith({
          'footprint . transport': { public: 'oui', valeur: 12.5 },
          'footprint . food': { public: 'oui', valeur: 0 },
        })
      )

      expect(await findRuleEvaluations()).toEqual([
        {
          name: 'footprint . food',
          metric: 'carbon',
          applicable: true,
          valueNumber: 0,
        },
        {
          name: 'footprint . food',
          metric: 'water',
          applicable: true,
          valueNumber: 0,
        },
        {
          name: 'footprint . transport',
          metric: 'carbon',
          applicable: true,
          valueNumber: 12.5,
        },
        {
          name: 'footprint . transport',
          metric: 'water',
          applicable: true,
          valueNumber: 12.5,
        },
      ])
    })

    it('stores a public rule valued null or false as not applicable', async () => {
      await evaluate(
        engineWith({
          'footprint . null': { public: 'oui', 'non applicable si': 'oui' },
          'footprint . false': { public: 'oui', valeur: 'non' },
        })
      )

      expect(await findRuleEvaluations()).toEqual([
        {
          name: 'footprint . false',
          metric: 'carbon',
          applicable: false,
          valueNumber: null,
        },
        {
          name: 'footprint . false',
          metric: 'water',
          applicable: false,
          valueNumber: null,
        },
        {
          name: 'footprint . null',
          metric: 'carbon',
          applicable: false,
          valueNumber: null,
        },
        {
          name: 'footprint . null',
          metric: 'water',
          applicable: false,
          valueNumber: null,
        },
      ])
    })

    it('stores a public rule the situation leaves undefined, or without a formula, as not defined', async () => {
      await evaluate(
        engineWith({
          'footprint . unanswered': {
            public: 'oui',
            question: 'Combien ?',
            unité: 'kgCO2e',
          },
          'footprint . no formula': { public: 'oui' },
        })
      )

      expect(await findRuleEvaluations()).toEqual([
        {
          name: 'footprint . no formula',
          metric: 'carbon',
          applicable: null,
          valueNumber: null,
        },
        {
          name: 'footprint . no formula',
          metric: 'water',
          applicable: null,
          valueNumber: null,
        },
        {
          name: 'footprint . unanswered',
          metric: 'carbon',
          applicable: null,
          valueNumber: null,
        },
        {
          name: 'footprint . unanswered',
          metric: 'water',
          applicable: null,
          valueNumber: null,
        },
      ])
    })

    it('evaluates each public rule for carbon and for water', async () => {
      await evaluate(
        engineWith({
          'footprint . water dependent': {
            public: 'oui',
            valeur: {
              variations: [{ si: "métrique = 'eau'", alors: 5 }, { sinon: 10 }],
            },
          },
        })
      )

      expect(await findRuleEvaluations()).toEqual([
        {
          name: 'footprint . water dependent',
          metric: 'carbon',
          applicable: true,
          valueNumber: 10,
        },
        {
          name: 'footprint . water dependent',
          metric: 'water',
          applicable: true,
          valueNumber: 5,
        },
      ])
    })

    it('stores no evaluation for rules not marked public', async () => {
      await evaluate(
        engineWith({
          'footprint . public': { public: 'oui', valeur: 1 },
          'footprint . private': { valeur: 2 },
          'footprint . explicitly private': { public: 'non', valeur: 3 },
        })
      )

      expect(await findRuleEvaluations()).toEqual([
        expect.objectContaining({
          name: 'footprint . public',
          metric: 'carbon',
        }),
        expect.objectContaining({
          name: 'footprint . public',
          metric: 'water',
        }),
      ])
    })

    describe('skipped public rules', () => {
      it('skips a public rule valued true or a string, warns, and stores the others', async () => {
        await evaluate(
          engineWith({
            'footprint . number': { public: 'oui', valeur: 1 },
            'footprint . true': { public: 'oui', valeur: 'oui' },
            'footprint . string': { public: 'oui', valeur: "'texte'" },
          })
        )

        expect(await findRuleEvaluations()).toEqual([
          expect.objectContaining({
            name: 'footprint . number',
            metric: 'carbon',
          }),
          expect.objectContaining({
            name: 'footprint . number',
            metric: 'water',
          }),
        ])

        // The simulation is named by the logger's bindings.
        expect(logger.child).toHaveBeenCalledWith(
          expect.objectContaining({ simulationId: simulation.id })
        )
        for (const dottedName of ['footprint . true', 'footprint . string']) {
          for (const metric of ['carbone', 'eau']) {
            expect(logger.warn).toHaveBeenCalledWith(
              expect.stringContaining('Unexpected nodeValue'),
              expect.objectContaining({ dottedName, metric })
            )
          }
        }
      })

      it('skips a public rule valued NaN or ±Infinity, warns, and stores the others', async () => {
        const nonFiniteEngine = engineWith({
          'footprint . number': { public: 'oui', valeur: 1 },
          'footprint . nan': { public: 'oui', valeur: 1 },
          'footprint . infinity': { public: 'oui', valeur: 1 },
          'footprint . minus infinity': { public: 'oui', valeur: 1 },
        })
        // No publicodes formula evaluates to a non-finite number.
        const nonFiniteValues: Record<string, number> = {
          'footprint . nan': NaN,
          'footprint . infinity': Infinity,
          'footprint . minus infinity': -Infinity,
        }
        const evaluateRule = nonFiniteEngine.evaluate.bind(nonFiniteEngine)
        vi.spyOn(nonFiniteEngine, 'evaluate').mockImplementation(
          (expression) => {
            const evaluated = evaluateRule(expression)
            const name =
              typeof expression === 'object' && 'valeur' in expression
                ? String(expression.valeur)
                : String(expression)
            return name in nonFiniteValues
              ? { ...evaluated, nodeValue: nonFiniteValues[name] }
              : evaluated
          }
        )

        await evaluate(nonFiniteEngine)

        expect(await findRuleEvaluations()).toEqual([
          expect.objectContaining({
            name: 'footprint . number',
            metric: 'carbon',
          }),
          expect.objectContaining({
            name: 'footprint . number',
            metric: 'water',
          }),
        ])
        for (const [dottedName, nodeValue] of Object.entries(nonFiniteValues)) {
          for (const metric of ['carbone', 'eau']) {
            expect(logger.warn).toHaveBeenCalledWith(
              `Unexpected nodeValue: ${nodeValue}`,
              expect.objectContaining({ dottedName, metric })
            )
          }
        }
      })

      it('skips a public rule whose evaluation throws, warns, and stores the others', async () => {
        await expect(
          evaluate(
            engineWith({
              'footprint . number': { public: 'oui', valeur: 1 },
              'footprint . throwing': { public: 'oui', valeur: '1 / 0' },
            })
          )
        ).resolves.not.toThrow()

        expect(await findRuleEvaluations()).toEqual([
          expect.objectContaining({
            name: 'footprint . number',
            metric: 'carbon',
          }),
          expect.objectContaining({
            name: 'footprint . number',
            metric: 'water',
          }),
        ])
        for (const metric of ['carbone', 'eau']) {
          expect(logger.warn).toHaveBeenCalledWith(expect.any(Error), {
            dottedName: 'footprint . throwing',
            metric,
          })
        }
      })
    })

    it('stores no evaluation when the model has no public rules, and still assesses actions', async () => {
      await evaluate(engineWith({}))

      expect(await findRuleEvaluations()).toEqual([])
      expect(await prisma.rule.count()).toBe(0)
      expect(
        await prisma.actionAssessment.count({
          where: { simulationId: simulation.id },
        })
      ).toBe(1)
    })

    describe('rules', () => {
      const findRules = () =>
        prisma.rule.findMany({
          select: { name: true, metric: true, title: true, description: true },
          orderBy: [{ name: 'asc' }, { metric: 'asc' }],
        })

      const simulationOfModel = (publishedTag: string) =>
        simulationFactory
          .completed()
          .withModelRegion('FR')
          .withModelVersion({ publishedTag })
          .create()

      it('stores each public rule with its French title and description', async () => {
        await evaluate(
          engineWith({
            'footprint . described': {
              public: 'oui',
              titre: 'Transport',
              description: 'Les trajets du quotidien',
              valeur: 1,
            },
            'footprint . bare': { public: 'oui', valeur: 1 },
          })
        )

        expect(await findRules()).toEqual([
          {
            name: 'footprint . bare',
            metric: 'carbon',
            title: null,
            description: null,
          },
          {
            name: 'footprint . bare',
            metric: 'water',
            title: null,
            description: null,
          },
          {
            name: 'footprint . described',
            metric: 'carbon',
            title: 'Transport',
            description: 'Les trajets du quotidien',
          },
          {
            name: 'footprint . described',
            metric: 'water',
            title: 'Transport',
            description: 'Les trajets du quotidien',
          },
        ])
      })

      it('reuses the rules of a model already processed', async () => {
        const [first, second] = await Promise.all([
          simulationOfModel('1.0.0'),
          simulationOfModel('1.0.0'),
        ])

        await evaluate(
          engineWith({
            'footprint . described': {
              public: 'oui',
              titre: 'Transport',
              valeur: 1,
            },
          }),
          { evaluated: first }
        )
        // Same model: its rules are not read again, the wording is unchanged.
        await evaluate(
          engineWith({
            'footprint . described': {
              public: 'oui',
              titre: 'Mobilité',
              valeur: 2,
            },
          }),
          { evaluated: second }
        )

        expect(await findRules()).toEqual([
          expect.objectContaining({
            name: 'footprint . described',
            metric: 'carbon',
            title: 'Transport',
          }),
          expect.objectContaining({
            name: 'footprint . described',
            metric: 'water',
            title: 'Transport',
          }),
        ])
        expect(await findRuleEvaluations(second.id)).toEqual([
          expect.objectContaining({ metric: 'carbon', valueNumber: 2 }),
          expect.objectContaining({ metric: 'water', valueNumber: 2 }),
        ])
      })

      it('reuses the rules of the same model in another locale', async () => {
        const [french, english] = await Promise.all([
          simulationOfModel('1.0.0'),
          simulationFactory
            .completed()
            .withModelRegion('FR')
            .withModelLocale('en')
            .withModelVersion({ publishedTag: '1.0.0' })
            .create(),
        ])

        await evaluate(
          engineWith({
            'footprint . described': {
              public: 'oui',
              titre: 'Transport',
              valeur: 1,
            },
          }),
          { evaluated: french }
        )
        // Locales share the fr rules: the rules are not read again.
        await evaluate(
          engineWith({
            'footprint . described': {
              public: 'oui',
              titre: 'Mobilité',
              valeur: 2,
            },
          }),
          { evaluated: english }
        )

        expect(await findRules()).toEqual([
          expect.objectContaining({ metric: 'carbon', title: 'Transport' }),
          expect.objectContaining({ metric: 'water', title: 'Transport' }),
        ])
      })

      it('refreshes the title and description when a new model is first processed', async () => {
        const [first, second] = await Promise.all([
          simulationOfModel('1.0.0'),
          simulationOfModel('1.1.0'),
        ])

        await evaluate(
          engineWith({
            'footprint . described': {
              public: 'oui',
              titre: 'Transport',
              description: 'Les trajets',
              valeur: 1,
            },
          }),
          { evaluated: first }
        )
        await evaluate(
          engineWith({
            'footprint . described': {
              public: 'oui',
              titre: 'Mobilité',
              valeur: 1,
            },
          }),
          { evaluated: second }
        )

        expect(await findRules()).toEqual([
          {
            name: 'footprint . described',
            metric: 'carbon',
            title: 'Mobilité',
            description: null,
          },
          {
            name: 'footprint . described',
            metric: 'water',
            title: 'Mobilité',
            description: null,
          },
        ])
        expect(await findRuleEvaluations(first.id)).toHaveLength(2)
        expect(await findRuleEvaluations(second.id)).toHaveLength(2)
      })

      // PGlite has a single connection, so the two evaluations interleave
      // rather than truly race: this proves the upsert is idempotent across
      // separate resolver caches, not that concurrent transactions are safe.
      it('upserts the same Rule rows from two resolvers with separate caches', async () => {
        const [first, second] = await Promise.all([
          simulationOfModel('1.0.0'),
          simulationOfModel('1.0.0'),
        ])
        const publicRulesEngine = engineWith({
          'footprint . transport': { public: 'oui', valeur: 1 },
        })

        // One resolver per worker process, each with its own cache.
        await Promise.all([
          evaluate(publicRulesEngine, {
            evaluated: first,
            resolve: createResolvePublicRules(),
          }),
          evaluate(publicRulesEngine, {
            evaluated: second,
            resolve: createResolvePublicRules(),
          }),
        ])

        expect(await findRules()).toHaveLength(2)
        const ruleIdsOf = async (simulationId: string) =>
          (
            await prisma.ruleEvaluation.findMany({
              where: { simulationId },
              orderBy: { ruleId: 'asc' },
            })
          ).map(({ ruleId }) => ruleId)
        expect(await ruleIdsOf(first.id)).toHaveLength(2)
        expect(await ruleIdsOf(second.id)).toEqual(await ruleIdsOf(first.id))
      })
    })

    // The model marks its public rules with an attribute publicodes does not
    // know: it must reach the parsed rules for them to be found.
    it('keeps `public: oui` on the parsed rules', () => {
      const parsedRules = createTestEngine({
        'footprint . transport': { public: 'oui', valeur: 1 },
      }).getParsedRules()

      expect(parsedRules['footprint . transport'].rawNode.public).toBe('oui')
    })
  })
})
