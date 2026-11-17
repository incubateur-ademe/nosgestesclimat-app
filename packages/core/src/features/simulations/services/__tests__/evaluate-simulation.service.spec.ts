import type Engine from 'publicodes'
import type { RawPublicodes } from 'publicodes'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { success, type Result } from '../../../../lib/result.ts'
import { transaction } from '../../../../lib/transaction.ts'
import { prisma } from '../../../../prisma/client.ts'
import { emptyDatabase } from '../../../../test-utils/empty-database.ts'
import { createTestLogger } from '../../../../test-utils/logger.ts'
import { ruleFactory } from '../../../models/factories/rule.factory.ts'
import { findRuleByNameAndMetric } from '../../../models/repositories/rules.repository.ts'
import type { Applicability } from '../../../models/types/model-rule-evaluation.ts'
import {
  PUBLIC_RULE_METRICS,
  type Metric,
  type Rule,
} from '../../../models/types/rule.ts'
import {
  createTestEngine,
  METRIC_RULE,
} from '../../../simulation-computation/factories/engine.factory.ts'
import { PublicRulesEvaluationError } from '../../errors/simulations.error.ts'
import { simulationFactory } from '../../factories/simulation.factory.ts'
import {
  findDetailedRuleEvaluationsBySimulation,
  findRuleEvaluationsBySimulation,
} from '../../repository/rule-evaluations.repository.ts'
import type { Simulation } from '../../types/simulation.ts'
import { createEvaluateSimulation } from '../evaluate-simulation.service.ts'

const logger = createTestLogger()
const evaluateSimulation = createEvaluateSimulation({ logger })

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

/** Stores each rule for each metric, in the order of `names`, carbon before water. */
const storeRules = (names: string[]): Promise<Rule[]> =>
  Promise.all(
    names.flatMap((name) =>
      PUBLIC_RULE_METRICS.map((metric) => ruleFactory.create({ name, metric }))
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

  /**
   * The simulation's evaluations in the order of `rules`, by name then metric,
   * whatever order they are stored in.
   */
  const findRuleEvaluations = async (rules: Rule[]) => {
    const ruleIds = rules.map(({ id }) => id)
    return (await findRuleEvaluationsBySimulation(simulation.id)).toSorted(
      (a, b) => ruleIds.indexOf(a.ruleId) - ruleIds.indexOf(b.ruleId)
    )
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
    const [transportCarbon, transportWater, foodCarbon, foodWater] = rules

    await evaluate(
      engineWith({
        'footprint . transport': { public: 'oui', valeur: 12.5 },
        'footprint . food': { public: 'oui', valeur: 0 },
      }),
      rules
    )

    expect(await findRuleEvaluations(rules)).toEqual([
      {
        simulationId: simulation.id,
        ruleId: transportCarbon.id,
        createdAt: expect.any(Date),
        applicable: true,
        value: 12.5,
      },
      {
        simulationId: simulation.id,
        ruleId: transportWater.id,
        createdAt: expect.any(Date),
        applicable: true,
        value: 12.5,
      },
      {
        simulationId: simulation.id,
        ruleId: foodCarbon.id,
        createdAt: expect.any(Date),
        applicable: true,
        value: 0,
      },
      {
        simulationId: simulation.id,
        ruleId: foodWater.id,
        createdAt: expect.any(Date),
        applicable: true,
        value: 0,
      },
    ])
  })

  // A `non` is an answer, never a rule that does not apply.
  it('stores each public rule with a boolean value as applicable, false included', async () => {
    const rules = await storeRules(['footprint . yes', 'footprint . no'])
    const [yesCarbon, yesWater, noCarbon, noWater] = rules

    await evaluate(
      engineWith({
        'footprint . yes': { public: 'oui', valeur: 'oui' },
        'footprint . no': { public: 'oui', valeur: 'non' },
      }),
      rules
    )

    expect(await findRuleEvaluations(rules)).toEqual([
      {
        simulationId: simulation.id,
        ruleId: yesCarbon.id,
        createdAt: expect.any(Date),
        applicable: true,
        value: true,
      },
      {
        simulationId: simulation.id,
        ruleId: yesWater.id,
        createdAt: expect.any(Date),
        applicable: true,
        value: true,
      },
      {
        simulationId: simulation.id,
        ruleId: noCarbon.id,
        createdAt: expect.any(Date),
        applicable: true,
        value: false,
      },
      {
        simulationId: simulation.id,
        ruleId: noWater.id,
        createdAt: expect.any(Date),
        applicable: true,
        value: false,
      },
    ])
  })

  it('stores each public rule with a string value as applicable, the empty string included', async () => {
    const rules = await storeRules(['footprint . text', 'footprint . empty'])
    const [textCarbon, textWater, emptyCarbon, emptyWater] = rules

    await evaluate(
      engineWith({
        'footprint . text': { public: 'oui', valeur: "'texte'" },
        'footprint . empty': { public: 'oui', valeur: "''" },
      }),
      rules
    )

    expect(await findRuleEvaluations(rules)).toEqual([
      {
        simulationId: simulation.id,
        ruleId: textCarbon.id,
        createdAt: expect.any(Date),
        applicable: true,
        value: 'texte',
      },
      {
        simulationId: simulation.id,
        ruleId: textWater.id,
        createdAt: expect.any(Date),
        applicable: true,
        value: 'texte',
      },
      {
        simulationId: simulation.id,
        ruleId: emptyCarbon.id,
        createdAt: expect.any(Date),
        applicable: true,
        value: '',
      },
      {
        simulationId: simulation.id,
        ruleId: emptyWater.id,
        createdAt: expect.any(Date),
        applicable: true,
        value: '',
      },
    ])
  })

  it('stores a public rule valued null as not applicable, whatever its type', async () => {
    const rules = await storeRules([
      'footprint . number',
      'footprint . boolean',
      'footprint . string',
    ])
    const [
      numberCarbon,
      numberWater,
      booleanCarbon,
      booleanWater,
      stringCarbon,
      stringWater,
    ] = rules

    await evaluate(
      engineWith({
        'footprint . number': {
          public: 'oui',
          'non applicable si': 'oui',
          valeur: 1,
        },
        'footprint . boolean': {
          public: 'oui',
          'applicable si': 'non',
          valeur: 'oui',
        },
        'footprint . string': {
          public: 'oui',
          'applicable si': 'non',
          valeur: "'texte'",
        },
      }),
      rules
    )

    expect(await findRuleEvaluations(rules)).toEqual([
      {
        simulationId: simulation.id,
        ruleId: numberCarbon.id,
        createdAt: expect.any(Date),
        applicable: false,
      },
      {
        simulationId: simulation.id,
        ruleId: numberWater.id,
        createdAt: expect.any(Date),
        applicable: false,
      },
      {
        simulationId: simulation.id,
        ruleId: booleanCarbon.id,
        createdAt: expect.any(Date),
        applicable: false,
      },
      {
        simulationId: simulation.id,
        ruleId: booleanWater.id,
        createdAt: expect.any(Date),
        applicable: false,
      },
      {
        simulationId: simulation.id,
        ruleId: stringCarbon.id,
        createdAt: expect.any(Date),
        applicable: false,
      },
      {
        simulationId: simulation.id,
        ruleId: stringWater.id,
        createdAt: expect.any(Date),
        applicable: false,
      },
    ])
  })

  it('stores a public rule the situation leaves undefined, or without a formula, as not defined', async () => {
    const rules = await storeRules([
      'footprint . unanswered',
      'footprint . no formula',
    ])
    const [unansweredCarbon, unansweredWater, noFormulaCarbon, noFormulaWater] =
      rules

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

    expect(await findRuleEvaluations(rules)).toEqual([
      {
        simulationId: simulation.id,
        ruleId: unansweredCarbon.id,
        createdAt: expect.any(Date),
        applicable: undefined,
      },
      {
        simulationId: simulation.id,
        ruleId: unansweredWater.id,
        createdAt: expect.any(Date),
        applicable: undefined,
      },
      {
        simulationId: simulation.id,
        ruleId: noFormulaCarbon.id,
        createdAt: expect.any(Date),
        applicable: undefined,
      },
      {
        simulationId: simulation.id,
        ruleId: noFormulaWater.id,
        createdAt: expect.any(Date),
        applicable: undefined,
      },
    ])
  })

  it('evaluates each public rule for its metric', async () => {
    const rules = await storeRules(['footprint . water dependent'])
    const [carbonRule, waterRule] = rules

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

    expect(await findRuleEvaluations(rules)).toEqual([
      {
        simulationId: simulation.id,
        ruleId: carbonRule.id,
        createdAt: expect.any(Date),
        applicable: true,
        value: 10,
      },
      {
        simulationId: simulation.id,
        ruleId: waterRule.id,
        createdAt: expect.any(Date),
        applicable: true,
        value: 5,
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

    expect(await findRuleEvaluations([carbonRule])).toEqual([
      {
        simulationId: simulation.id,
        ruleId: carbonRule.id,
        createdAt: expect.any(Date),
        applicable: true,
        value: 1,
      },
    ])
  })

  // The rules given are trusted to be public: the model's `public` mark is not
  // checked again.
  it('stores a given rule the model does not mark public like a public one', async () => {
    const rules = await storeRules(['footprint . private'])
    const [carbonRule, waterRule] = rules

    const result = await evaluate(
      engineWith({ 'footprint . private': { valeur: 3 } }),
      rules
    )

    expect(result).toEqual(success())
    expect(await findRuleEvaluations(rules)).toEqual([
      {
        simulationId: simulation.id,
        ruleId: carbonRule.id,
        createdAt: expect.any(Date),
        applicable: true,
        value: 3,
      },
      {
        simulationId: simulation.id,
        ruleId: waterRule.id,
        createdAt: expect.any(Date),
        applicable: true,
        value: 3,
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
    expect(logger.error).toHaveBeenCalledTimes(PUBLIC_RULE_METRICS.length)
  })

  it('stores nothing when given no public rules', async () => {
    const result = await evaluate(engineWith({}), [])

    expect(result).toEqual(success())
    expect(await findRuleEvaluations([])).toEqual([])
  })

  // The stored evaluations of a simulation are complete for its model: one
  // rule that cannot be evaluated fails them all.
  describe('fails, storing nothing and reporting each public rule that cannot be evaluated', () => {
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
          PUBLIC_RULE_METRICS.map((metric) =>
            expect.objectContaining({
              code: 'unexpected_node_value',
              dottedName,
              metric,
              nodeValue: String(nodeValue),
            })
          )
        )
      )
      expect(await findRuleEvaluations(rules)).toEqual([])
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
        PUBLIC_RULE_METRICS.map((metric) =>
          expect.objectContaining({
            code: 'rule_evaluation_threw',
            dottedName: 'footprint . throwing',
            metric,
            cause: expect.any(Error),
          })
        )
      )
      expect(await findRuleEvaluations(rules)).toEqual([])
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
        PUBLIC_RULE_METRICS.map((metric) =>
          expect.objectContaining({
            code: 'rule_evaluation_threw',
            dottedName: 'footprint . missing',
            metric,
            cause: expect.any(Error),
          })
        )
      )
      expect(await findRuleEvaluations(rules)).toEqual([])
    })
  })

  describe('missing variables', () => {
    const findRule = async (name: string, metric: Metric) => {
      const rule = await findRuleByNameAndMetric({ name, metric })
      if (!rule) {
        throw new Error(`Rule ${name} (${metric}) was not stored`)
      }
      return rule.id
    }

    /** A stored rule evaluation of the simulation. */
    const evaluation = (ruleId: number, applicability: Applicability) => ({
      simulationId: simulation.id,
      ruleId,
      createdAt: expect.any(Date),
      ...applicability,
    })

    const findDetailed = () =>
      findDetailedRuleEvaluationsBySimulation(simulation.id)

    it('stores each missing variable as an evaluation of its own, linked to the evaluations that reported it with its weight', async () => {
      const rules = await storeRules(['footprint . total'])
      const [totalCarbon, totalWater] = rules

      const result = await evaluate(
        engineWith({
          'footprint . total': { public: 'oui', valeur: 'transport . km * 2' },
          'transport . km': { question: 'Combien de km ?', unité: 'km' },
        }),
        rules
      )

      expect(result).toEqual(success())

      const kmCarbonId = await findRule('transport . km', 'carbon')
      const kmWaterId = await findRule('transport . km', 'water')
      const unanswered = { applicable: undefined }

      // The missing variable is evaluated like any rule: unanswered, it is
      // not defined.
      const detailed = await findDetailed()
      expect(detailed).toHaveLength(4)
      expect(detailed).toEqual(
        expect.arrayContaining([
          {
            ...evaluation(totalCarbon.id, unanswered),
            missingVariables: [
              { ...evaluation(kmCarbonId, unanswered), weight: 1 },
            ],
          },
          {
            ...evaluation(totalWater.id, unanswered),
            missingVariables: [
              { ...evaluation(kmWaterId, unanswered), weight: 1 },
            ],
          },
          { ...evaluation(kmCarbonId, unanswered), missingVariables: [] },
          { ...evaluation(kmWaterId, unanswered), missingVariables: [] },
        ])
      )
    })

    // The engine wraps a `par défaut` in a `variable manquante`: the rule has
    // its default value and is still reported as missing.
    it('stores a missing variable with a default as applicable with its default value, still linked as missing', async () => {
      const rules = await storeRules(['footprint . total'])
      const [totalCarbon, totalWater] = rules

      const result = await evaluate(
        engineWith({
          'footprint . total': { public: 'oui', valeur: 'transport . km * 2' },
          'transport . km': {
            question: 'Combien de km ?',
            unité: 'km',
            'par défaut': 100,
          },
        }),
        rules
      )

      expect(result).toEqual(success())

      const kmCarbonId = await findRule('transport . km', 'carbon')
      const kmWaterId = await findRule('transport . km', 'water')
      const byDefault = { applicable: true, value: 100 } as const

      const detailed = await findDetailed()
      expect(detailed).toHaveLength(4)
      expect(detailed).toEqual(
        expect.arrayContaining([
          // The public rule still outputs a value: the default's.
          {
            ...evaluation(totalCarbon.id, { applicable: true, value: 200 }),
            missingVariables: [
              { ...evaluation(kmCarbonId, byDefault), weight: 1 },
            ],
          },
          {
            ...evaluation(totalWater.id, { applicable: true, value: 200 }),
            missingVariables: [
              { ...evaluation(kmWaterId, byDefault), weight: 1 },
            ],
          },
          // The missing variable's own evaluation is its default.
          { ...evaluation(kmCarbonId, byDefault), missingVariables: [] },
          { ...evaluation(kmWaterId, byDefault), missingVariables: [] },
        ])
      )
    })

    it('evaluates a missing variable reported by several evaluations once, linked to each', async () => {
      const [doubleCarbon, , halfCarbon] = await storeRules([
        'footprint . double',
        'footprint . half',
      ])

      const result = await evaluate(
        engineWith({
          'footprint . double': { public: 'oui', valeur: 'transport . km * 2' },
          'footprint . half': { public: 'oui', valeur: 'transport . km / 2' },
          'transport . km': { question: 'Combien de km ?', 'par défaut': 10 },
        }),
        [doubleCarbon, halfCarbon]
      )

      expect(result).toEqual(success())

      const kmCarbonId = await findRule('transport . km', 'carbon')
      const km = { ...evaluation(kmCarbonId, { applicable: true, value: 10 }) }

      const detailed = await findDetailed()
      expect(detailed).toHaveLength(3)
      expect(detailed).toEqual(
        expect.arrayContaining([
          {
            ...evaluation(doubleCarbon.id, { applicable: true, value: 20 }),
            missingVariables: [{ ...km, weight: 1 }],
          },
          {
            ...evaluation(halfCarbon.id, { applicable: true, value: 5 }),
            missingVariables: [{ ...km, weight: 1 }],
          },
          { ...km, missingVariables: [] },
        ])
      )
    })

    // A rule with a `par défaut` lists itself in its own missing variables.
    it('never links a rule to itself', async () => {
      const rules = await storeRules(['footprint . self'])
      const [selfCarbon, selfWater] = rules

      const result = await evaluate(
        engineWith({ 'footprint . self': { public: 'oui', 'par défaut': 5 } }),
        rules
      )

      expect(result).toEqual(success())
      expect(await findDetailed()).toEqual(
        expect.arrayContaining([
          {
            ...evaluation(selfCarbon.id, { applicable: true, value: 5 }),
            missingVariables: [],
          },
          {
            ...evaluation(selfWater.id, { applicable: true, value: 5 }),
            missingVariables: [],
          },
        ])
      )
      expect(await findDetailed()).toHaveLength(2)
    })

    it('stores the missing variables of each metric under that metric', async () => {
      const rules = await storeRules(['footprint . dependent'])
      const [dependentCarbon, dependentWater] = rules

      const result = await evaluate(
        engineWith({
          'footprint . dependent': {
            public: 'oui',
            valeur: {
              variations: [
                { si: "métrique = 'eau'", alors: 'water . question' },
                { sinon: 'carbon . question' },
              ],
            },
          },
          'carbon . question': { question: 'Carbone ?' },
          'water . question': { question: 'Eau ?' },
        }),
        rules
      )

      expect(result).toEqual(success())

      const carbonQuestionId = await findRule('carbon . question', 'carbon')
      const waterQuestionId = await findRule('water . question', 'water')
      // Each metric's missing variable got its own rule row.
      expect(
        await prisma.rule.count({ where: { name: 'carbon . question' } })
      ).toBe(1)
      expect(
        await prisma.rule.count({ where: { name: 'water . question' } })
      ).toBe(1)

      const unanswered = { applicable: undefined }
      expect(await findDetailed()).toEqual(
        expect.arrayContaining([
          {
            ...evaluation(dependentCarbon.id, unanswered),
            missingVariables: [
              { ...evaluation(carbonQuestionId, unanswered), weight: 1 },
            ],
          },
          {
            ...evaluation(dependentWater.id, unanswered),
            missingVariables: [
              { ...evaluation(waterQuestionId, unanswered), weight: 1 },
            ],
          },
        ])
      )
    })

    // The missing variables' rule rows are resolved in the job's transaction:
    // a rollback leaves no orphan behind.
    it('stores nothing, not even the missing variables, when a rule fails', async () => {
      const rules = await storeRules(['footprint . ok', 'footprint . throwing'])

      const result = await evaluate(
        engineWith({
          'footprint . ok': { public: 'oui', valeur: 'missing . var * 2' },
          'missing . var': { question: '?' },
          'footprint . throwing': { public: 'oui', valeur: '1 / 0' },
        }),
        rules
      )

      expect(failedRules(result)).toHaveLength(PUBLIC_RULE_METRICS.length)
      expect(await findDetailed()).toEqual([])
      expect(
        await prisma.rule.findMany({ where: { name: 'missing . var' } })
      ).toEqual([])
    })

    it('resolves the same missing variable rule once across simulations', async () => {
      const rules = await storeRules(['footprint . total'])
      const engine = engineWith({
        'footprint . total': { public: 'oui', valeur: 'transport . km * 2' },
        'transport . km': { question: 'Combien de km ?', unité: 'km' },
      })

      expect(await evaluate(engine, rules)).toEqual(success())

      const otherSimulation = await simulationFactory.completed().create()
      const result = await transaction((session) =>
        evaluateSimulation(engine, otherSimulation.id, rules, { session })
      )
      expect(result).toEqual(success())

      // One rule row per metric, shared by both simulations.
      expect(
        await prisma.rule.count({ where: { name: 'transport . km' } })
      ).toBe(PUBLIC_RULE_METRICS.length)
      const otherDetailed = await findDetailedRuleEvaluationsBySimulation(
        otherSimulation.id
      )
      expect(
        otherDetailed.flatMap(({ missingVariables }) => missingVariables)
      ).toHaveLength(PUBLIC_RULE_METRICS.length)
    })
  })
})
