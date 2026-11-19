import type { Logger } from '../../logger/index.ts'
import { MODEL_METRIC } from '../../models/types/rule.ts'
import { findSimulationComputation } from '../../simulation-computation/repositories/simulation-computations.repository.ts'
import { toComputedResults } from '../helpers/to-computed-results.ts'
import { findNamedRuleEvaluationsBySimulation } from '../repository/rule-evaluations.repository.ts'
import type { Simulation } from '../types/simulation.ts'
import type { ComputedResults } from '../validators/computed-results.schema.ts'

/** The model metric names (`carbone`, `eau`), derived from the model's metric
 * mapping so they live in one place. */
const METRICS = Object.values(MODEL_METRIC)

type Category = keyof ComputedResults[(typeof METRICS)[number]]['categories']

/** A leaf of a `ComputedResults` where the aggregate and the stored column
 * disagree: `bilan`, a category or a subcategory key, per metric. */
interface ComputedResultsDiff {
  path: string
  aggregatedValue: number | undefined
  storedValue: number | undefined
}

/**
 * Resolves a simulation's `computedResults` from its stored rule evaluations,
 * the server-computed footprint, falling back to the stored column when they
 * cannot be trusted:
 *
 * - No rule evaluation at all (failed job, timeout, unsupported model,
 *   legacy simulation): one warning with the simulation id — plus the
 *   computation status when a computation row exists — and the stored column.
 * - Otherwise the evaluations are aggregated and diffed leaf-by-leaf against
 *   the stored column, per metric: one warning per differing leaf with its
 *   path and both values. Any difference and the column wins for the whole
 *   `computedResults`; none and the aggregate is returned.
 *
 * The evaluations are read only through the joined rule-evaluations read, the
 * computation status only through the computation repository.
 */
export function createResolveComputedResults({ logger }: { logger: Logger }) {
  return async function resolveComputedResults(
    simulation: Simulation
  ): Promise<ComputedResults> {
    const { id: simulationId, computedResults: stored } = simulation
    const scopedLogger = logger.child({
      scope: 'core.service.resolveComputedResults',
      simulationId,
    })

    const evaluations = await findNamedRuleEvaluationsBySimulation(simulationId)

    if (evaluations.length === 0) {
      const computation = await findSimulationComputation(simulationId)
      scopedLogger.warn(
        'Simulation has no rule evaluations, falling back to the stored computedResults',
        { simulationId, computationStatus: computation?.status ?? null }
      )
      return stored
    }

    const aggregate = toComputedResults(evaluations)
    const diffs = diffComputedResults(aggregate, stored)
    for (const { path, aggregatedValue, storedValue } of diffs) {
      scopedLogger.warn(
        'Aggregated rule evaluations differ from the stored computedResults, keeping the stored column',
        { simulationId, path, aggregatedValue, storedValue }
      )
    }

    return diffs.length > 0 ? stored : aggregate
  }
}

/** Diffs two `computedResults` leaf-by-leaf, per metric: `bilan`, each
 * category, each subcategory key compared by exact key — a key present on one
 * side only is a differing leaf. */
const diffComputedResults = (
  aggregate: ComputedResults,
  stored: ComputedResults
): ComputedResultsDiff[] => {
  const diffs: ComputedResultsDiff[] = []

  for (const metric of METRICS) {
    const aggregatedMetric = aggregate[metric]
    const storedMetric = stored[metric]

    if (aggregatedMetric.bilan !== storedMetric.bilan) {
      diffs.push({
        path: `${metric}.bilan`,
        aggregatedValue: aggregatedMetric.bilan,
        storedValue: storedMetric.bilan,
      })
    }

    for (const category of Object.keys(
      aggregatedMetric.categories
    ) as Category[]) {
      const aggregatedValue = aggregatedMetric.categories[category]
      const storedValue = storedMetric.categories[category]
      if (aggregatedValue !== storedValue) {
        diffs.push({
          path: `${metric}.categories.${category}`,
          aggregatedValue,
          storedValue,
        })
      }
    }

    const subcategoryKeys = new Set([
      ...Object.keys(aggregatedMetric.subcategories),
      ...Object.keys(storedMetric.subcategories),
    ])
    for (const key of subcategoryKeys) {
      const aggregatedValue = aggregatedMetric.subcategories[key]
      const storedValue = storedMetric.subcategories[key]
      if (aggregatedValue !== storedValue) {
        diffs.push({
          path: `${metric}.subcategories[${key}]`,
          aggregatedValue,
          storedValue,
        })
      }
    }
  }

  return diffs
}
