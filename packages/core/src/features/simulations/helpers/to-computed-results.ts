import { MODEL_METRIC, type Metric } from '../../models/types/rule.ts'
import type { NamedRuleEvaluation } from '../types/rule-evaluation.ts'
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

const isFootprintLine = (name: string) =>
  name !== BILAN_RULE_NAME && !(CATEGORIES as readonly string[]).includes(name)

/**
 * The numeric value of an evaluation, mirroring the client-side computation
 * where a non-number becomes 0: a not applicable or not defined line counts
 * as 0, and so does an absent one.
 */
const numericValue = (evaluation: NamedRuleEvaluation | undefined): number =>
  evaluation?.applicable === true && typeof evaluation.value === 'number'
    ? evaluation.value
    : 0

/**
 * Aggregates a simulation's named rule evaluations into the `computedResults`
 * shape: each stored metric mapped through `MODEL_METRIC` (`carbon` →
 * `carbone`, `water` → `eau`), the `bilan` from the `bilan` evaluation, the five
 * output-contract categories from their evaluations, and every remaining
 * evaluation as a subcategory keyed by its full dotted name.
 *
 * Boolean and string evaluations are skipped: they are not footprint values.
 * Not applicable, not defined and absent lines count as 0.
 */
export const toComputedResults = (
  evaluations: NamedRuleEvaluation[]
): ComputedResults => {
  const results = emptyComputedResults()

  for (const metric of Object.keys(MODEL_METRIC) as Metric[]) {
    const metricResults = results[MODEL_METRIC[metric] as 'carbone' | 'eau']
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
      if (!isFootprintLine(evaluation.name)) continue
      // A boolean or string value is not a footprint line: skipped, not 0.
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
