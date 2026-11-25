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
import { findRule } from '../../../models/repositories/rules.repository.ts'
import type { Applicability } from '../../../models/types/model-rule-evaluation.ts'
import type { Metric, Rule } from '../../../models/types/rule.ts'
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

/**
 * Stores each rule's rows in the order of `names`: the default metric's row
 * always, plus the water metric's row when `appliesToWaterMetric`.
 */
const storeRules = (
  names: string[],
  appliesToWaterMetric = false
): Promise<Rule[]> =>
  Promise.all(
    names.flatMap((name) => [
      ruleFactory.create({ name, appliesToWaterMetric: false }),
      ...(appliesToWaterMetric
        ? [ruleFactory.create({ name, appliesToWaterMetric: true })]
        : []),
    ])
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
   * whatever order they are stored in. A rule without a metric is the default
   * one's evaluation.
   */
  const findRuleEvaluations = async (
    rules: { name: string; metric?: Metric | null }[]
  ) => {
    const keys = rules.map(({ name, metric }) => ruleKey(name, metric))
    return (await findRuleEvaluationsBySimulation(simulation.id)).toSorted(
      (a, b) =>
        keys.indexOf(ruleKey(a.name, a.metric)) -
        keys.indexOf(ruleKey(b.name, b.metric))
    )
  }

  /** A stored rule evaluation of the simulation, read back by its rule. */
  const evaluation = (
    { name, metric = null }: { name: string; metric?: Metric | null },
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
    const [transport, food] = rules

    await evaluate(
      engineWith({
        'footprint . transport': { public: 'oui', valeur: 12.5 },
        'footprint . food': { public: 'oui', valeur: 0 },
      }),
      rules
    )

    expect(await findRuleEvaluations(rules)).toEqual([
      evaluation(transport, { applicable: true, value: 12.5 }),
      evaluation(food, { applicable: true, value: 0 }),
    ])
  })

  it('stores each public rule with a boolean value as applicable, false included', async () => {
    const rules = await storeRules(['footprint . yes', 'footprint . no'])
    const [yes, no] = rules

    await evaluate(
      engineWith({
        'footprint . yes': { public: 'oui', valeur: 'oui' },
        'footprint . no': { public: 'oui', valeur: 'non' },
      }),
      rules
    )

    expect(await findRuleEvaluations(rules)).toEqual([
      evaluation(yes, { applicable: true, value: true }),
      evaluation(no, { applicable: true, value: false }),
    ])
  })

  it('stores each public rule with a string value as applicable, the empty string included', async () => {
    const rules = await storeRules(['footprint . text', 'footprint . empty'])
    const [text, empty] = rules

    await evaluate(
      engineWith({
        'footprint . text': { public: 'oui', valeur: "'texte'" },
        'footprint . empty': { public: 'oui', valeur: "''" },
      }),
      rules
    )

    expect(await findRuleEvaluations(rules)).toEqual([
      evaluation(text, { applicable: true, value: 'texte' }),
      evaluation(empty, { applicable: true, value: '' }),
    ])
  })

  it('stores a public rule valued null as not applicable, whatever its type', async () => {
    const rules = await storeRules([
      'footprint . number',
      'footprint . boolean',
      'footprint . string',
    ])
    const [number, boolean, string] = rules

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
      evaluation(number, { applicable: false }),
      evaluation(boolean, { applicable: false }),
      evaluation(string, { applicable: false }),
    ])
  })

  it('stores a public rule the situation leaves undefined, or without a formula, as not defined', async () => {
    const rules = await storeRules([
      'footprint . unanswered',
      'footprint . no formula',
    ])
    const [unanswered, noFormula] = rules

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
      evaluation(unanswered, { applicable: undefined }),
      evaluation(noFormula, { applicable: undefined }),
    ])
  })

  // A rule stored with `appliesToWaterMetric` — the model's
  // `empreinte eau: oui` — has two rows sharing its name, and each row gets
  // its own evaluation: the default row with the default metric's context,
  // the water row with the water metric's.
  describe('water metric context', () => {
    it('evaluates each row of a water-applicable rule with its own metric', async () => {
      const [waterDependent, waterDependentWater] = await storeRules(
        ['footprint . water dependent'],
        true
      )
      const [carbonOnly] = await storeRules(['footprint . carbon only'])
      const value = {
        variations: [{ si: "métrique = 'eau'", alors: 5 }, { sinon: 10 }],
      }

      await evaluate(
        engineWith({
          'footprint . water dependent': {
            public: 'oui',
            'empreinte eau': 'oui',
            valeur: value,
          },
          'footprint . carbon only': { public: 'oui', valeur: value },
        }),
        [waterDependent, waterDependentWater, carbonOnly]
      )

      expect(
        await findRuleEvaluations([
          waterDependent,
          { ...waterDependent, metric: 'water' as const },
          carbonOnly,
        ])
      ).toEqual([
        evaluation(waterDependent, { applicable: true, value: 10 }),
        evaluation(
          { ...waterDependent, metric: 'water' as const },
          { applicable: true, value: 5 }
        ),
        evaluation(carbonOnly, { applicable: true, value: 10 }),
      ])

      // Each evaluation references its own rule row.
      const storedEvaluations = await prisma.ruleEvaluation.findMany({
        orderBy: { ruleId: 'asc' },
        select: { ruleId: true },
      })
      expect(storedEvaluations.map(({ ruleId }) => ruleId)).toEqual([
        waterDependent.id,
        waterDependentWater.id,
        carbonOnly.id,
      ])

      // Two rule rows for the water-applicable rule, one for the other.
      expect(
        await prisma.rule.count({
          where: { name: 'footprint . water dependent' },
        })
      ).toBe(2)
      expect(
        await prisma.rule.count({ where: { name: 'footprint . carbon only' } })
      ).toBe(1)
    })
  })

  it('evaluates only the public rules it is given', async () => {
    const [given] = await storeRules(['footprint . given'])

    await evaluate(
      engineWith({
        'footprint . given': { public: 'oui', valeur: 1 },
        'footprint . not given': { public: 'oui', valeur: 2 },
      }),
      [given]
    )

    expect(await findRuleEvaluations([given])).toEqual([
      evaluation(given, { applicable: true, value: 1 }),
    ])
  })

  // The rules given are trusted to be public: the model's `public` mark is not
  // checked again.
  it('stores a given rule the model does not mark public like a public one', async () => {
    const [privateRule] = await storeRules(['footprint . private'])

    const result = await evaluate(
      engineWith({ 'footprint . private': { valeur: 3 } }),
      [privateRule]
    )

    expect(result).toEqual(success())
    expect(await findRuleEvaluations([privateRule])).toEqual([
      evaluation(privateRule, { applicable: true, value: 3 }),
    ])
  })

  it('reports the rules it cannot evaluate with their simulation', async () => {
    const rules = await storeRules(['footprint . missing'])

    await evaluate(engineWith({}), rules)

    expect(logger.child).toHaveBeenCalledWith({
      scope: 'core.service.evaluateSimulation',
      simulationId: simulation.id,
    })
    expect(logger.error).toHaveBeenCalledTimes(1)
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
        Object.entries(nonFiniteValues).map(([dottedName, nodeValue]) =>
          expect.objectContaining({
            code: 'unexpected_node_value',
            dottedName,
            metric: null,
            nodeValue: String(nodeValue),
          })
        )
      )
      expect(await findRuleEvaluations(rules)).toEqual([])
    })

    it('when its evaluation throws, once per metric it is evaluated for', async () => {
      const rules = await storeRules(['footprint . number'])
      const [throwing, throwingWater] = await storeRules(
        ['footprint . throwing'],
        true
      )

      const result = await evaluate(
        engineWith({
          'footprint . number': { public: 'oui', valeur: 1 },
          'footprint . throwing': { public: 'oui', valeur: '1 / 0' },
        }),
        [...rules, throwing, throwingWater]
      )

      expect(failedRules(result)).toEqual([
        expect.objectContaining({
          code: 'rule_evaluation_threw',
          dottedName: 'footprint . throwing',
          metric: null,
          cause: expect.any(Error),
        }),
        expect.objectContaining({
          code: 'rule_evaluation_threw',
          dottedName: 'footprint . throwing',
          metric: 'water',
          cause: expect.any(Error),
        }),
      ])
      expect(await findRuleEvaluations([...rules, throwing])).toEqual([])
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

      expect(failedRules(result)).toEqual([
        expect.objectContaining({
          code: 'rule_evaluation_threw',
          dottedName: 'footprint . missing',
          metric: null,
          cause: expect.any(Error),
        }),
      ])
      expect(await findRuleEvaluations(rules)).toEqual([])
    })
  })

  describe('missing variables', () => {
    const findStoredRule = async (name: string, metric?: Metric | null) => {
      const rule = await findRule(name, { metric })
      if (!rule) {
        throw new Error(`Rule ${name} was not stored`)
      }
      return rule
    }

    const findEvaluations = () => findRuleEvaluationsBySimulation(simulation.id)

    const findLinks = () =>
      prisma.ruleEvaluationMissingVariable.findMany({
        orderBy: [{ ruleId: 'asc' }, { missingRuleId: 'asc' }],
      })

    it('stores each missing variable as a rule linked with its weight, without evaluating it', async () => {
      const rules = await storeRules(['footprint . total'])
      const [total] = rules

      const result = await evaluate(
        engineWith({
          'footprint . total': { public: 'oui', valeur: 'transport . km * 2' },
          'transport . km': { question: 'Combien de km ?', unité: 'km' },
        }),
        rules
      )

      expect(result).toEqual(success())

      const km = await findStoredRule('transport . km')
      // The missing variable has a rule row, but no evaluation of its own,
      // and is not marked `public: oui` in the model.
      expect(km.public).toBe(false)
      expect(await findEvaluations()).toEqual([
        evaluation(total, { applicable: undefined }, [
          { name: 'transport . km', weight: 1 },
        ]),
      ])
      expect(await findLinks()).toEqual([
        {
          simulationId: simulation.id,
          ruleId: total.id,
          missingRuleId: km.id,
          weight: 1,
        },
      ])
    })

    // The engine wraps a `par défaut` in a `variable manquante`: the public
    // rule gets its default value, and the missing variable is still linked.
    it('links a missing variable with a default, still without evaluating it', async () => {
      const rules = await storeRules(['footprint . total'])
      const [total] = rules

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

      await findStoredRule('transport . km')
      // The public rule still outputs a value: the default's.
      expect(await findEvaluations()).toEqual([
        evaluation(total, { applicable: true, value: 200 }, [
          { name: 'transport . km', weight: 1 },
        ]),
      ])
    })

    it('stores a missing variable reported by several evaluations once as a rule, linked to each', async () => {
      const [double, half] = await storeRules([
        'footprint . double',
        'footprint . half',
      ])

      const result = await evaluate(
        engineWith({
          'footprint . double': { public: 'oui', valeur: 'transport . km * 2' },
          'footprint . half': { public: 'oui', valeur: 'transport . km / 2' },
          'transport . km': { question: 'Combien de km ?', 'par défaut': 10 },
        }),
        [double, half]
      )

      expect(result).toEqual(success())

      const km = await findStoredRule('transport . km')
      expect(
        await prisma.rule.count({ where: { name: 'transport . km' } })
      ).toBe(1)

      expect(await findEvaluations()).toEqual(
        expect.arrayContaining([
          evaluation(double, { applicable: true, value: 20 }, [
            { name: 'transport . km', weight: 1 },
          ]),
          evaluation(half, { applicable: true, value: 5 }, [
            { name: 'transport . km', weight: 1 },
          ]),
        ])
      )
      // No evaluation for the missing variable itself.
      expect(await findEvaluations()).toHaveLength(2)
      expect(await findLinks()).toEqual([
        {
          simulationId: simulation.id,
          ruleId: double.id,
          missingRuleId: km.id,
          weight: 1,
        },
        {
          simulationId: simulation.id,
          ruleId: half.id,
          missingRuleId: km.id,
          weight: 1,
        },
      ])
    })

    it('never links a rule to itself', async () => {
      const [self] = await storeRules(['footprint . self'])

      const result = await evaluate(
        engineWith({ 'footprint . self': { public: 'oui', 'par défaut': 5 } }),
        [self]
      )

      expect(result).toEqual(success())
      expect(await findEvaluations()).toEqual([
        evaluation(self, { applicable: true, value: 5 }),
      ])
      expect(await findLinks()).toEqual([])
    })

    it('links each metric’s missing variables from that metric’s evaluation row, to the missing variable’s row of that metric when there is one', async () => {
      const [dependent, dependentWaterRow] = await storeRules(
        ['footprint . dependent'],
        true
      )

      const result = await evaluate(
        engineWith({
          'footprint . dependent': {
            public: 'oui',
            'empreinte eau': 'oui',
            valeur: {
              variations: [
                { si: "métrique = 'eau'", alors: 'water . question' },
                { sinon: 'carbon . question' },
              ],
            },
          },
          'carbon . question': { question: 'Carbone ?' },
          'water . question': { question: 'Eau ?', 'empreinte eau': 'oui' },
        }),
        [dependent, dependentWaterRow]
      )

      expect(result).toEqual(success())

      const dependentWater = { ...dependent, metric: 'water' as const }
      const carbonQuestion = await findStoredRule('carbon . question')
      const waterQuestion = await findStoredRule('water . question')
      const waterQuestionWater = await findStoredRule(
        'water . question',
        'water'
      )
      // One row per name for the rule without the water mark, two for the one
      // with it.
      expect(
        await prisma.rule.count({ where: { name: 'carbon . question' } })
      ).toBe(1)
      expect(
        await prisma.rule.count({ where: { name: 'water . question' } })
      ).toBe(2)

      expect(await findRuleEvaluations([dependent, dependentWater])).toEqual([
        evaluation(dependent, { applicable: undefined }, [
          { name: carbonQuestion.name, weight: 1 },
        ]),
        evaluation(dependentWater, { applicable: undefined }, [
          { name: waterQuestion.name, weight: 1 },
        ]),
      ])
      expect(await findLinks()).toEqual([
        {
          simulationId: simulation.id,
          ruleId: dependent.id,
          missingRuleId: carbonQuestion.id,
          weight: 1,
        },
        {
          simulationId: simulation.id,
          ruleId: dependentWaterRow.id,
          missingRuleId: waterQuestionWater.id,
          weight: 1,
        },
      ])
    })

    it("stores the model's `empreinte eau` mark on a missing variable's rule rows", async () => {
      const [total] = await storeRules(['footprint . total'])

      const result = await evaluate(
        engineWith({
          'footprint . total': { public: 'oui', valeur: 'transport . km * 2' },
          'transport . km': {
            question: 'Combien de km ?',
            unité: 'km',
            'empreinte eau': 'oui',
          },
        }),
        [total]
      )

      expect(result).toEqual(success())
      // Both rows of the water-marked missing variable are stored, though it
      // is never evaluated.
      expect(
        await prisma.rule.count({ where: { name: 'transport . km' } })
      ).toBe(2)
      expect(
        (await findStoredRule('transport . km', 'water')).appliesToWaterMetric
      ).toBe(true)
      // The link from the default metric's evaluation points to the default row.
      expect(await findLinks()).toEqual([
        {
          simulationId: simulation.id,
          ruleId: total.id,
          missingRuleId: (await findStoredRule('transport . km')).id,
          weight: 1,
        },
      ])
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

      expect(failedRules(result)).toHaveLength(1)
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

      // One rule row, shared by both simulations.
      expect(
        await prisma.rule.count({ where: { name: 'transport . km' } })
      ).toBe(1)
      const otherEvaluations = await findRuleEvaluationsBySimulation(
        otherSimulation.id
      )
      expect(
        otherEvaluations.flatMap(({ missingVariables }) => missingVariables)
      ).toHaveLength(1)
    })
  })
})
