import type Engine from 'publicodes'
import type { RawPublicodes } from 'publicodes'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { transaction } from '../../../../lib/transaction.ts'
import { prisma } from '../../../../prisma/client.ts'
import { emptyDatabase } from '../../../../test-utils/empty-database.ts'
import { createTestLogger } from '../../../../test-utils/logger.ts'
import { ruleFactory } from '../../../models/factories/rule.factory.ts'
import { PUBLIC_RULE_METRICS, type Rule } from '../../../models/types/rule.ts'
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

/** An engine with the given rules, next to the metric they are evaluated for. */
const engineWith = (rules: RawPublicodes<string>) =>
  createTestEngine({ ...METRIC_RULE, ...rules })

/** Stores each named rule for every metric. */
const storeRules = (names: string[]): Promise<Rule[]> =>
  Promise.all(
    names.flatMap((name) =>
      PUBLIC_RULE_METRICS.map((metric) => ruleFactory.create({ name, metric }))
    )
  )

describe('evaluateSimulation', () => {
  let simulation: Simulation

  /**
   * Evaluates the simulation inside a transaction. PGlite has a single
   * connection, so a write that bypasses the session would hang the test.
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

  it('stores nothing when given no public rules', async () => {
    await evaluate(engineWith({}), [])

    expect(await findRuleEvaluations()).toEqual([])
  })

  describe('skipped public rules', () => {
    it('skips a public rule valued true or a string, warns, and stores the others', async () => {
      const rules = await storeRules([
        'footprint . number',
        'footprint . true',
        'footprint . string',
      ])

      await evaluate(
        engineWith({
          'footprint . number': { public: 'oui', valeur: 1 },
          'footprint . true': { public: 'oui', valeur: 'oui' },
          'footprint . string': { public: 'oui', valeur: "'texte'" },
        }),
        rules
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
        for (const metric of PUBLIC_RULE_METRICS) {
          expect(logger.warn).toHaveBeenCalledWith(
            expect.stringContaining('Unexpected nodeValue'),
            { dottedName, metric }
          )
        }
      }
    })

    it('skips a public rule valued NaN or ±Infinity, warns, and stores the others', async () => {
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

      await evaluate(nonFiniteEngine, rules)

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
        for (const metric of PUBLIC_RULE_METRICS) {
          expect(logger.warn).toHaveBeenCalledWith(
            `Unexpected nodeValue: ${nodeValue}`,
            { dottedName, metric }
          )
        }
      }
    })

    it('skips a public rule whose evaluation throws, warns, and stores the others', async () => {
      const rules = await storeRules([
        'footprint . number',
        'footprint . throwing',
      ])

      await expect(
        evaluate(
          engineWith({
            'footprint . number': { public: 'oui', valeur: 1 },
            'footprint . throwing': { public: 'oui', valeur: '1 / 0' },
          }),
          rules
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
      for (const metric of PUBLIC_RULE_METRICS) {
        expect(logger.warn).toHaveBeenCalledWith(expect.any(Error), {
          dottedName: 'footprint . throwing',
          metric,
        })
      }
    })
  })
})
