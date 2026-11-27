import type { RuleEvaluation } from '../../models/types/rule-evaluation.ts'
import type { Metric } from '../../models/types/rule.ts'
import type { ComputedResults } from '../validators/computed-results.schema.ts'
import { emptyComputedResults } from './empty-computed-results.ts'

const BILAN_RULE_NAME = 'bilan'

/** The model's output-contract categories: the top-level rules the `bilan`
 * rule sums, exposed as the `categories` of a `ComputedResults`. */
const CATEGORIES = [
  'alimentation',
  'transport',
  'logement',
  'divers',
  'services sociétaux',
] as const

/** The stored metric of each `ComputedResults` key: the default metric is
 * stored as null and maps to `carbone`, the water metric to `eau`. */
const METRICS: { key: 'carbone' | 'eau'; metric: Metric | null }[] = [
  { key: 'carbone', metric: null },
  { key: 'eau', metric: 'water' },
]

/** A subcategory line: not the `bilan`, not one of the categories. */
const isSubcategoryLine = (name: string) =>
  name !== BILAN_RULE_NAME && !(CATEGORIES as readonly string[]).includes(name)

/**
 * The numeric value of an evaluation, mirroring the client-side computation
 * where a non-number becomes 0: a not applicable or not defined line counts
 * as 0, and so does an absent one.
 */
const numericValue = (evaluation: RuleEvaluation | undefined): number =>
  evaluation?.applicable === true && typeof evaluation.value === 'number'
    ? evaluation.value
    : 0

/**
 * Aggregates a simulation's rule evaluations into the `computedResults`
 * shape: the default metric (stored as null) into `carbone`, the water
 * metric into `eau`, the `bilan` from the `bilan` evaluation, the five
 * output-contract categories from their evaluations, and every remaining
 * evaluation as a subcategory keyed by its full dotted name.
 *
 * Boolean and string evaluations are skipped: they are not footprint values.
 * Not applicable, not defined and absent lines count as 0.
 */
export const toComputedResults = (
  evaluations: RuleEvaluation[]
): ComputedResults => {
  const results = emptyComputedResults()

  for (const { key, metric } of METRICS) {
    const metricResults = results[key]
    const byName = new Map(
      evaluations
        .filter((evaluation) => evaluation.metric === metric)
        .map((evaluation) => [evaluation.name, evaluation])
    )

    metricResults.bilan = numericValue(byName.get(BILAN_RULE_NAME))

    for (const category of CATEGORIES) {
      metricResults.categories[category] = numericValue(byName.get(category))
    }

    for (const evaluation of byName.values()) {
      if (!isSubcategoryLine(evaluation.name)) continue
      // A boolean or string value is not a subcategory line: skipped, not 0.
      if (
        evaluation.applicable === true &&
        typeof evaluation.value !== 'number'
      )
        continue
      metricResults.subcategories[evaluation.name] = numericValue(evaluation)
    }
  }

  return results
}
