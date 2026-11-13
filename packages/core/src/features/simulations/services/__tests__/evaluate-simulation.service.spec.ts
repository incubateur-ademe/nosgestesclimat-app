import type Engine from 'publicodes'
import type { RawPublicodes } from 'publicodes'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { success, type Result } from '../../../../lib/result.ts'
import { transaction } from '../../../../lib/transaction.ts'
import { prisma } from '../../../../prisma/client.ts'
import { emptyDatabase } from '../../../../test-utils/empty-database.ts'
import { createTestLogger } from '../../../../test-utils/logger.ts'
import { ruleFactory } from '../../../models/factories/rule.factory.ts'
import {
  FOOTPRINT_RULE_METRICS,
  type Rule,
} from '../../../models/types/rule.ts'
import { createTestEngine } from '../../../simulation-computation/factories/engine.factory.ts'
import { PublicRulesEvaluationError } from '../../errors/simulations.error.ts'
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

/** An engine with the given rules, next to the metric they are evaluated for. */
const engineWith = (rules: RawPublicodes<string>) =>
  createTestEngine({ ...METRIC_RULE, ...rules })

/**
 * The rule evaluation errors reported for a failed evaluation, which counts
 * them.
 */
const failedRules = (result: Result<void, PublicRulesEvaluationError>) => {
  if (result.success) {
    throw new Error('Expected evaluateSimulation to fail')
  }
  expect(result.error).toBeInstanceOf(PublicRulesEvaluationError)
  const reported = vi.mocked(logger.error).mock.calls.map(([error]) => error)
  expect(result.error.failedCount).toBe(reported.length)
  return reported
}

const storeRules = (names: string[]): Promise<Rule[]> =>
  Promise.all(
    names.flatMap((name) =>
      FOOTPRINT_RULE_METRICS.map((metric) =>
        ruleFactory.create({ name, metric })
      )
    )
  )

describe('evaluateSimulation', () => {
  let simulation: Simulation

  /**
   * PGlite has a single connection, so a write that bypasses the session
   * would hang the test.
   */
  const evaluate = (engine: Engine, publicRules: Rule[]) =>
    transaction((session) =>
      evaluateSimulation(engine, simulation.id, publicRules, { session })
    )

  const findRuleEvaluations = async () => {
    const rows = await prisma.ruleEvaluation.findMany({
      where: { simulationId: simulation.id },
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
    vi.clearAllMocks()
    simulation = await simulationFactory.completed().create()
  })

  afterEach(async () => {
    vi.restoreAllMocks()
    await emptyDatabase(prisma)
  })

  it('stores each public rule with a numeric value as applicable, 0 included', async () => {
    const rules = await storeRules([
      'footprint . transport',
      'footprint . food',
    ])

    await evaluate(
      engineWith({
        'footprint . transport': { public: 'oui', valeur: 12.5 },
        'footprint . food': { public: 'oui', valeur: 0 },
      }),
      rules
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
    const rules = await storeRules(['footprint . null', 'footprint . false'])

    await evaluate(
      engineWith({
        'footprint . null': { public: 'oui', 'non applicable si': 'oui' },
        'footprint . false': { public: 'oui', valeur: 'non' },
      }),
      rules
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
    const rules = await storeRules([
      'footprint . unanswered',
      'footprint . no formula',
    ])

    await evaluate(
      engineWith({
        'footprint . unanswered': {
          public: 'oui',
          question: 'Combien ?',
          unité: 'kgCO2e',
        },
        'footprint . no formula': { public: 'oui' },
      }),
      rules
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

  it('evaluates each public rule for its metric', async () => {
    const rules = await storeRules(['footprint . water dependent'])

    await evaluate(
      engineWith({
        'footprint . water dependent': {
          public: 'oui',
          valeur: {
            variations: [{ si: "métrique = 'eau'", alors: 5 }, { sinon: 10 }],
          },
        },
      }),
      rules
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

  it('evaluates a rule without a metric context when it has none', async () => {
    const rule = await ruleFactory.create({
      name: 'footprint . no metric',
      metric: null,
    })
    const engine = engineWith({
      'footprint . no metric': {
        public: 'oui',
        valeur: {
          variations: [{ si: "métrique = 'eau'", alors: 5 }, { sinon: 10 }],
        },
      },
    })
    const evaluateRule = vi.spyOn(engine, 'evaluate')

    await evaluate(engine, [rule])

    expect(evaluateRule).toHaveBeenCalledWith('footprint . no metric')
    expect(
      evaluateRule.mock.calls.filter(
        ([expression]) =>
          typeof expression === 'object' &&
          expression !== null &&
          'contexte' in expression
      )
    ).toEqual([])
    expect(await findRuleEvaluations()).toEqual([
      {
        name: 'footprint . no metric',
        metric: null,
        applicable: true,
        valueNumber: 10,
      },
    ])
  })

  it('evaluates only the public rules it is given', async () => {
    const [carbonRule] = await storeRules(['footprint . given'])

    await evaluate(
      engineWith({
        'footprint . given': { public: 'oui', valeur: 1 },
        'footprint . not given': { public: 'oui', valeur: 2 },
      }),
      [carbonRule]
    )

    expect(await findRuleEvaluations()).toEqual([
      expect.objectContaining({ name: 'footprint . given', metric: 'carbon' }),
    ])
  })

  // The rules given are trusted to be public: the model's `public` mark is not
  // checked again.
  it('stores a given rule the model does not mark public like a public one', async () => {
    const rules = await storeRules(['footprint . private'])

    const result = await evaluate(
      engineWith({ 'footprint . private': { valeur: 3 } }),
      rules
    )

    expect(result).toEqual(success())
    expect(await findRuleEvaluations()).toEqual([
      {
        name: 'footprint . private',
        metric: 'carbon',
        applicable: true,
        valueNumber: 3,
      },
      {
        name: 'footprint . private',
        metric: 'water',
        applicable: true,
        valueNumber: 3,
      },
    ])
  })

  it('reports the rules it cannot evaluate with their simulation', async () => {
    const rules = await storeRules(['footprint . missing'])

    await evaluate(engineWith({}), rules)

    expect(logger.child).toHaveBeenCalledWith({
      scope: 'core.service.evaluateSimulation',
      simulationId: simulation.id,
    })
    expect(logger.error).toHaveBeenCalledTimes(FOOTPRINT_RULE_METRICS.length)
  })

  it('stores nothing when given no public rules', async () => {
    const result = await evaluate(engineWith({}), [])

    expect(result).toEqual(success())
    expect(await findRuleEvaluations()).toEqual([])
  })

  // The stored evaluations of a simulation are complete for its model: one
  // rule that cannot be evaluated fails them all.
  describe('fails, storing nothing and reporting each public rule that cannot be evaluated', () => {
    it('when valued true or a string', async () => {
      const rules = await storeRules([
        'footprint . number',
        'footprint . true',
        'footprint . string',
      ])

      const result = await evaluate(
        engineWith({
          'footprint . number': { public: 'oui', valeur: 1 },
          'footprint . true': { public: 'oui', valeur: 'oui' },
          'footprint . string': { public: 'oui', valeur: "'texte'" },
        }),
        rules
      )

      expect(failedRules(result)).toEqual(
        [
          { dottedName: 'footprint . true', nodeValue: 'boolean' },
          { dottedName: 'footprint . string', nodeValue: 'string' },
        ].flatMap(({ dottedName, nodeValue }) =>
          FOOTPRINT_RULE_METRICS.map((metric) =>
            expect.objectContaining({
              code: 'unexpected_node_value',
              dottedName,
              metric,
              nodeValue,
            })
          )
        )
      )
      expect(await findRuleEvaluations()).toEqual([])
    })

    it('when valued NaN or ±Infinity', async () => {
      // No publicodes formula evaluates to a non-finite number.
      const nonFiniteValues: Record<string, number> = {
        'footprint . nan': NaN,
        'footprint . infinity': Infinity,
        'footprint . minus infinity': -Infinity,
      }
      const rules = await storeRules([
        'footprint . number',
        ...Object.keys(nonFiniteValues),
      ])
      const nonFiniteEngine = engineWith(
        Object.fromEntries(
          ['footprint . number', ...Object.keys(nonFiniteValues)].map(
            (name) => [name, { public: 'oui', valeur: 1 }]
          )
        )
      )
      const evaluateRule = nonFiniteEngine.evaluate.bind(nonFiniteEngine)
      vi.spyOn(nonFiniteEngine, 'evaluate').mockImplementation((expression) => {
        const evaluated = evaluateRule(expression)
        const name =
          typeof expression === 'object' && 'valeur' in expression
            ? String(expression.valeur)
            : String(expression)
        return name in nonFiniteValues
          ? { ...evaluated, nodeValue: nonFiniteValues[name] }
          : evaluated
      })

      const result = await evaluate(nonFiniteEngine, rules)

      expect(failedRules(result)).toEqual(
        Object.entries(nonFiniteValues).flatMap(([dottedName, nodeValue]) =>
          FOOTPRINT_RULE_METRICS.map((metric) =>
            expect.objectContaining({
              code: 'unexpected_node_value',
              dottedName,
              metric,
              nodeValue: String(nodeValue),
            })
          )
        )
      )
      expect(await findRuleEvaluations()).toEqual([])
    })

    it('when its evaluation throws', async () => {
      const rules = await storeRules([
        'footprint . number',
        'footprint . throwing',
      ])

      const result = await evaluate(
        engineWith({
          'footprint . number': { public: 'oui', valeur: 1 },
          'footprint . throwing': { public: 'oui', valeur: '1 / 0' },
        }),
        rules
      )

      expect(failedRules(result)).toEqual(
        FOOTPRINT_RULE_METRICS.map((metric) =>
          expect.objectContaining({
            code: 'rule_evaluation_threw',
            dottedName: 'footprint . throwing',
            metric,
            cause: expect.any(Error),
          })
        )
      )
      expect(await findRuleEvaluations()).toEqual([])
    })

    it('when missing from the model', async () => {
      const rules = await storeRules([
        'footprint . number',
        'footprint . missing',
      ])

      const result = await evaluate(
        engineWith({ 'footprint . number': { public: 'oui', valeur: 1 } }),
        rules
      )

      expect(failedRules(result)).toEqual(
        FOOTPRINT_RULE_METRICS.map((metric) =>
          expect.objectContaining({
            code: 'rule_evaluation_threw',
            dottedName: 'footprint . missing',
            metric,
            cause: expect.any(Error),
          })
        )
      )
      expect(await findRuleEvaluations()).toEqual([])
    })
  })
})
