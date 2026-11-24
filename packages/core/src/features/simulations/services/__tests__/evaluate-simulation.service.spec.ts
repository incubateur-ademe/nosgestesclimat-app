import type Engine from 'publicodes'
import type { RawPublicodes } from 'publicodes'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { success, type Result } from '../../../../lib/result.ts'
import { transaction } from '../../../../lib/transaction.ts'
import { prisma } from '../../../../prisma/client.ts'
import { emptyDatabase } from '../../../../test-utils/empty-database.ts'
import { createTestLogger } from '../../../../test-utils/logger.ts'
import { ruleFactory } from '../../../models/factories/rule.factory.ts'
import { ruleKey } from '../../../models/helpers/rule-key.ts'
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
import { findRuleEvaluationsBySimulation } from '../../repository/rule-evaluations.repository.ts'
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
    const keys = rules.map(({ name, metric }) => ruleKey(metric, name))
    return (await findRuleEvaluationsBySimulation(simulation.id)).toSorted(
      (a, b) =>
        keys.indexOf(ruleKey(a.metric, a.name)) -
        keys.indexOf(ruleKey(b.metric, b.name))
    )
  }

  /** A stored rule evaluation of the simulation, read back by its rule. */
  const evaluation = (
    { name, metric }: Rule,
    applicability: Applicability,
    missingVariables: { name: string; weight: number }[] = []
  ) => ({
    simulationId: simulation.id,
    createdAt: expect.any(Date),
    name,
    metric,
    missingVariables,
    ...applicability,
  })

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
      evaluation(transportCarbon, { applicable: true, value: 12.5 }),
      evaluation(transportWater, { applicable: true, value: 12.5 }),
      evaluation(foodCarbon, { applicable: true, value: 0 }),
      evaluation(foodWater, { applicable: true, value: 0 }),
    ])
  })

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
      evaluation(yesCarbon, { applicable: true, value: true }),
      evaluation(yesWater, { applicable: true, value: true }),
      evaluation(noCarbon, { applicable: true, value: false }),
      evaluation(noWater, { applicable: true, value: false }),
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
      evaluation(textCarbon, { applicable: true, value: 'texte' }),
      evaluation(textWater, { applicable: true, value: 'texte' }),
      evaluation(emptyCarbon, { applicable: true, value: '' }),
      evaluation(emptyWater, { applicable: true, value: '' }),
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
      evaluation(numberCarbon, { applicable: false }),
      evaluation(numberWater, { applicable: false }),
      evaluation(booleanCarbon, { applicable: false }),
      evaluation(booleanWater, { applicable: false }),
      evaluation(stringCarbon, { applicable: false }),
      evaluation(stringWater, { applicable: false }),
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
      evaluation(unansweredCarbon, { applicable: undefined }),
      evaluation(unansweredWater, { applicable: undefined }),
      evaluation(noFormulaCarbon, { applicable: undefined }),
      evaluation(noFormulaWater, { applicable: undefined }),
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
      evaluation(carbonRule, { applicable: true, value: 10 }),
      evaluation(waterRule, { applicable: true, value: 5 }),
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
      evaluation(carbonRule, { applicable: true, value: 1 }),
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
      evaluation(carbonRule, { applicable: true, value: 3 }),
      evaluation(waterRule, { applicable: true, value: 3 }),
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
      return rule
    }

    const findEvaluations = () => findRuleEvaluationsBySimulation(simulation.id)

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

      const kmCarbon = await findRule('transport . km', 'carbon')
      const kmWater = await findRule('transport . km', 'water')
      const unanswered = { applicable: undefined }

      // The missing variable is evaluated like any rule: unanswered, it is
      // not defined.
      const evaluations = await findEvaluations()
      expect(evaluations).toHaveLength(4)
      expect(evaluations).toEqual(
        expect.arrayContaining([
          evaluation(totalCarbon, unanswered, [
            { name: 'transport . km', weight: 1 },
          ]),
          evaluation(totalWater, unanswered, [
            { name: 'transport . km', weight: 1 },
          ]),
          evaluation(kmCarbon, unanswered),
          evaluation(kmWater, unanswered),
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

      const kmCarbon = await findRule('transport . km', 'carbon')
      const kmWater = await findRule('transport . km', 'water')
      const byDefault = { applicable: true, value: 100 } as const

      const evaluations = await findEvaluations()
      expect(evaluations).toHaveLength(4)
      expect(evaluations).toEqual(
        expect.arrayContaining([
          // The public rule still outputs a value: the default's.
          evaluation(totalCarbon, { applicable: true, value: 200 }, [
            { name: 'transport . km', weight: 1 },
          ]),
          evaluation(totalWater, { applicable: true, value: 200 }, [
            { name: 'transport . km', weight: 1 },
          ]),
          // The missing variable's own evaluation is its default.
          evaluation(kmCarbon, byDefault),
          evaluation(kmWater, byDefault),
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

      const kmCarbon = await findRule('transport . km', 'carbon')

      const evaluations = await findEvaluations()
      expect(evaluations).toHaveLength(3)
      expect(evaluations).toEqual(
        expect.arrayContaining([
          evaluation(doubleCarbon, { applicable: true, value: 20 }, [
            { name: 'transport . km', weight: 1 },
          ]),
          evaluation(halfCarbon, { applicable: true, value: 5 }, [
            { name: 'transport . km', weight: 1 },
          ]),
          evaluation(kmCarbon, { applicable: true, value: 10 }),
        ])
      )
    })

    it('never links a rule to itself', async () => {
      const rules = await storeRules(['footprint . self'])
      const [selfCarbon, selfWater] = rules

      const result = await evaluate(
        engineWith({ 'footprint . self': { public: 'oui', 'par défaut': 5 } }),
        rules
      )

      expect(result).toEqual(success())
      expect(await findEvaluations()).toEqual(
        expect.arrayContaining([
          evaluation(selfCarbon, { applicable: true, value: 5 }),
          evaluation(selfWater, { applicable: true, value: 5 }),
        ])
      )
      expect(await findEvaluations()).toHaveLength(2)
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

      const carbonQuestion = await findRule('carbon . question', 'carbon')
      const waterQuestion = await findRule('water . question', 'water')
      // Each metric's missing variable got its own rule row.
      expect(
        await prisma.rule.count({ where: { name: 'carbon . question' } })
      ).toBe(1)
      expect(
        await prisma.rule.count({ where: { name: 'water . question' } })
      ).toBe(1)

      const unanswered = { applicable: undefined }
      expect(await findEvaluations()).toEqual(
        expect.arrayContaining([
          evaluation(dependentCarbon, unanswered, [
            { name: carbonQuestion.name, weight: 1 },
          ]),
          evaluation(dependentWater, unanswered, [
            { name: waterQuestion.name, weight: 1 },
          ]),
        ])
      )
    })

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
      expect(await findEvaluations()).toEqual([])
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
      const otherEvaluations = await findRuleEvaluationsBySimulation(
        otherSimulation.id
      )
      expect(
        otherEvaluations.flatMap(({ missingVariables }) => missingVariables)
      ).toHaveLength(PUBLIC_RULE_METRICS.length)
    })
  })
})
