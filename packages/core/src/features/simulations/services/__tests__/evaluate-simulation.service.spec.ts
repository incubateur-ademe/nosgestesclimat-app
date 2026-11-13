import type Engine from 'publicodes'
import type { RawPublicodes } from 'publicodes'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { success, type Result } from '../../../../lib/result.ts'
import { transaction } from '../../../../lib/transaction.ts'
import { prisma } from '../../../../prisma/client.ts'
import { emptyDatabase } from '../../../../test-utils/empty-database.ts'
import { createTestLogger } from '../../../../test-utils/logger.ts'
import { ruleFactory } from '../../../models/factories/rule.factory.ts'
import type { ModelRuleEvaluation } from '../../../models/types/model-rule-evaluation.ts'
import { PUBLIC_RULE_METRICS, type Rule } from '../../../models/types/rule.ts'
import { createTestEngine } from '../../../simulation-computation/factories/engine.factory.ts'
import { PublicRulesEvaluationError } from '../../errors/simulations.error.ts'
import { simulationFactory } from '../../factories/simulation.factory.ts'
import { findRuleEvaluationsBySimulation } from '../../repository/rule-evaluations.repository.ts'
import type { RuleEvaluation } from '../../types/rule-evaluation.ts'
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
      PUBLIC_RULE_METRICS.map((metric) => ruleFactory.create({ name, metric }))
    )
  )

/** Sorted, for evaluations to compare whatever order they are stored in. */
const byRuleId = (evaluations: RuleEvaluation[]) =>
  evaluations.toSorted((a, b) => a.ruleId - b.ruleId)

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

  const findRuleEvaluations = async () =>
    byRuleId(await findRuleEvaluationsBySimulation(simulation.id))

  /**
   * The evaluations expected of the simulation for `rules`, each given by its
   * rule's name, or by the rule itself when it depends on its metric.
   */
  const evaluationsOf = (
    rules: Rule[],
    evaluationOf:
      | Record<string, ModelRuleEvaluation>
      | ((rule: Rule) => ModelRuleEvaluation)
  ): RuleEvaluation[] =>
    byRuleId(
      rules.map((rule) => ({
        simulationId: simulation.id,
        ruleId: rule.id,
        createdAt: expect.any(Date) as Date,
        ...(typeof evaluationOf === 'function'
          ? evaluationOf(rule)
          : evaluationOf[rule.name]),
      }))
    )

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

    expect(await findRuleEvaluations()).toEqual(
      evaluationsOf(rules, {
        'footprint . transport': { applicable: true, value: 12.5 },
        'footprint . food': { applicable: true, value: 0 },
      })
    )
  })

  // A `non` is an answer, never a rule that does not apply.
  it('stores each public rule with a boolean value as applicable, false included', async () => {
    const rules = await storeRules(['footprint . yes', 'footprint . no'])

    await evaluate(
      engineWith({
        'footprint . yes': { public: 'oui', valeur: 'oui' },
        'footprint . no': { public: 'oui', valeur: 'non' },
      }),
      rules
    )

    expect(await findRuleEvaluations()).toEqual(
      evaluationsOf(rules, {
        'footprint . yes': { applicable: true, value: true },
        'footprint . no': { applicable: true, value: false },
      })
    )
  })

  it('stores a public rule valued null as not applicable, whatever its type', async () => {
    const rules = await storeRules([
      'footprint . number',
      'footprint . boolean',
    ])

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
      }),
      rules
    )

    expect(await findRuleEvaluations()).toEqual(
      evaluationsOf(rules, {
        'footprint . number': { applicable: false },
        'footprint . boolean': { applicable: false },
      })
    )
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

    expect(await findRuleEvaluations()).toEqual(
      evaluationsOf(rules, {
        'footprint . unanswered': { applicable: undefined },
        'footprint . no formula': { applicable: undefined },
      })
    )
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

    expect(await findRuleEvaluations()).toEqual(
      evaluationsOf(rules, ({ metric }) => ({
        applicable: true,
        value: metric === 'water' ? 5 : 10,
      }))
    )
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

    expect(await findRuleEvaluations()).toEqual(
      evaluationsOf([carbonRule], {
        'footprint . given': { applicable: true, value: 1 },
      })
    )
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
    expect(await findRuleEvaluations()).toEqual(
      evaluationsOf(rules, {
        'footprint . private': { applicable: true, value: 3 },
      })
    )
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
    expect(await findRuleEvaluations()).toEqual([])
  })

  // The stored evaluations of a simulation are complete for its model: one
  // rule that cannot be evaluated fails them all.
  describe('fails, storing nothing and reporting each public rule that cannot be evaluated', () => {
    it('when valued a string', async () => {
      const rules = await storeRules([
        'footprint . number',
        'footprint . string',
      ])

      const result = await evaluate(
        engineWith({
          'footprint . number': { public: 'oui', valeur: 1 },
          'footprint . string': { public: 'oui', valeur: "'texte'" },
        }),
        rules
      )

      expect(failedRules(result)).toEqual(
        [{ dottedName: 'footprint . string', nodeValue: 'string' }].flatMap(
          ({ dottedName, nodeValue }) =>
            PUBLIC_RULE_METRICS.map((metric) =>
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
        PUBLIC_RULE_METRICS.map((metric) =>
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
        PUBLIC_RULE_METRICS.map((metric) =>
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
