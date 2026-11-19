import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { prisma } from '../../../../prisma/client.ts'
import { emptyDatabase } from '../../../../test-utils/empty-database.ts'
import { createTestLogger } from '../../../../test-utils/logger.ts'
import { ruleFactory } from '../../../models/factories/rule.factory.ts'
import type { Applicability } from '../../../models/types/model-rule-evaluation.ts'
import type { Metric, Rule } from '../../../models/types/rule.ts'
import { simulationFactory } from '../../factories/simulation.factory.ts'
import { createRuleEvaluations } from '../../repository/rule-evaluations.repository.ts'
import type { NewRuleEvaluation } from '../../types/rule-evaluation.ts'
import type { Simulation } from '../../types/simulation.ts'
import type { ComputedResults } from '../../validators/computed-results.schema.ts'
import { createResolveComputedResults } from '../resolve-computed-results.service.ts'

const logger = createTestLogger()
const resolveComputedResults = createResolveComputedResults({ logger })

/** Seeds a rule evaluation of the simulation through the write path. */
const evaluateRule = async (
  simulation: Simulation,
  rule: Rule,
  applicability: Applicability
): Promise<void> => {
  const evaluation: NewRuleEvaluation = {
    simulationId: simulation.id,
    ruleId: rule.id,
    ...applicability,
    missingVariables: [],
  }
  await createRuleEvaluations([evaluation])
}

const storeRule = (name: string, metric: Metric): Promise<Rule> =>
  ruleFactory.create({ name, metric })

/** The five zeroed categories of a metric. */
const zeroedCategories = () => ({
  alimentation: 0,
  transport: 0,
  logement: 0,
  divers: 0,
  'services sociétaux': 0,
})

describe('resolveComputedResults', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(async () => {
    await emptyDatabase(prisma)
  })

  it('warns and returns the stored column when the simulation has no rule evaluations and no computation row', async () => {
    const simulation = await simulationFactory
      .completed()
      .withValidComputedResults()
      .create()

    const resolved = await resolveComputedResults(simulation)

    expect(resolved).toEqual(simulation.computedResults)
    expect(logger.warn).toHaveBeenCalledTimes(1)
    expect(logger.child).toHaveBeenCalledWith({
      scope: 'core.service.resolveComputedResults',
      simulationId: simulation.id,
    })
    expect(logger.warn).toHaveBeenCalledWith(expect.any(String), {
      simulationId: simulation.id,
      computationStatus: null,
    })
  })

  it('includes the computation status in the warning when a computation row exists', async () => {
    const simulation = await simulationFactory
      .completed()
      .withFailedComputation()
      .withValidComputedResults()
      .create()

    const resolved = await resolveComputedResults(simulation)

    expect(resolved).toEqual(simulation.computedResults)
    expect(logger.warn).toHaveBeenCalledTimes(1)
    expect(logger.warn).toHaveBeenCalledWith(expect.any(String), {
      simulationId: simulation.id,
      computationStatus: 'failed',
    })
  })

  it('returns the aggregate without warning when it matches the stored column', async () => {
    const column: ComputedResults = {
      carbone: {
        bilan: 1000,
        categories: { ...zeroedCategories(), transport: 400 },
        subcategories: { 'transport . voiture': 123.5 },
      },
      eau: {
        bilan: 500,
        categories: zeroedCategories(),
        subcategories: {},
      },
    }
    const simulation = await simulationFactory
      .completed()
      .withCompletedComputation()
      .params({ computedResults: column })
      .create()

    await evaluateRule(simulation, await storeRule('bilan', 'carbon'), {
      applicable: true,
      value: 1000,
    })
    await evaluateRule(simulation, await storeRule('bilan', 'water'), {
      applicable: true,
      value: 500,
    })
    await evaluateRule(simulation, await storeRule('transport', 'carbon'), {
      applicable: true,
      value: 400,
    })
    await evaluateRule(
      simulation,
      await storeRule('transport . voiture', 'carbon'),
      { applicable: true, value: 123.5 }
    )
    // A boolean evaluation is not a footprint line: no subcategory for it.
    await evaluateRule(
      simulation,
      await storeRule('transport . motorisé', 'carbon'),
      { applicable: true, value: true }
    )

    const resolved = await resolveComputedResults(simulation)

    expect(resolved).toEqual(column)
    expect(logger.warn).not.toHaveBeenCalled()
  })

  it('warns once per differing leaf with its path and both values, and returns the stored column', async () => {
    const stored: ComputedResults = {
      carbone: {
        bilan: 999,
        categories: { ...zeroedCategories(), transport: 400 },
        subcategories: {
          'transport . voiture': 100,
          'transport . avion': 10,
        },
      },
      eau: {
        bilan: 500,
        categories: { ...zeroedCategories(), transport: 5 },
        subcategories: {},
      },
    }
    const simulation = await simulationFactory
      .completed()
      .withCompletedComputation()
      .params({ computedResults: stored })
      .create()

    await evaluateRule(simulation, await storeRule('bilan', 'carbon'), {
      applicable: true,
      value: 1000,
    })
    await evaluateRule(simulation, await storeRule('bilan', 'water'), {
      applicable: true,
      value: 500,
    })
    await evaluateRule(simulation, await storeRule('transport', 'carbon'), {
      applicable: true,
      value: 400,
    })
    await evaluateRule(
      simulation,
      await storeRule('transport . voiture', 'carbon'),
      { applicable: true, value: 123.5 }
    )

    const resolved = await resolveComputedResults(simulation)

    expect(resolved).toEqual(stored)
    expect(logger.warn).toHaveBeenCalledTimes(4)
    expect(logger.warn).toHaveBeenCalledWith(expect.any(String), {
      simulationId: simulation.id,
      path: 'carbone.bilan',
      aggregatedValue: 1000,
      storedValue: 999,
    })
    expect(logger.warn).toHaveBeenCalledWith(expect.any(String), {
      simulationId: simulation.id,
      path: 'carbone.subcategories[transport . voiture]',
      aggregatedValue: 123.5,
      storedValue: 100,
    })
    expect(logger.warn).toHaveBeenCalledWith(expect.any(String), {
      simulationId: simulation.id,
      path: 'carbone.subcategories[transport . avion]',
      aggregatedValue: undefined,
      storedValue: 10,
    })
    expect(logger.warn).toHaveBeenCalledWith(expect.any(String), {
      simulationId: simulation.id,
      path: 'eau.categories.transport',
      aggregatedValue: 0,
      storedValue: 5,
    })
  })
})
