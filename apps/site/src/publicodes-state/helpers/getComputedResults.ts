import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import type {
  ComputedResults,
  ComputedResultsFootprint,
  Metric,
} from '../types'

export function getComputedResults({
  metrics,
  categories,
  subcategories,
  getNumericValue,
}: {
  metrics: Metric[]
  categories: DottedName[]
  subcategories: DottedName[]
  getNumericValue: (dottedName: DottedName, metric: Metric) => number
}): ComputedResults {
  return metrics.reduce((metricsAcc: ComputedResults, metric: Metric) => {
    // Get the footprint of the categories
    metricsAcc[metric] = categories.reduce(
      (categoriesAcc: ComputedResultsFootprint, category: DottedName) => {
        categoriesAcc.categories[category] = getNumericValue(category, metric)

        return categoriesAcc
      },
      {
        categories: {},
        subcategories: {},
        bilan: getNumericValue('bilan', metric),
      } as ComputedResultsFootprint
    )

    // Get the footprint of the subcategories
    metricsAcc[metric].subcategories = subcategories.reduce(
      (acc, subcategory) => {
        acc[subcategory] = getNumericValue(subcategory, metric)
        return acc
      },
      {} as Record<DottedName, number>
    )
    return metricsAcc
  }, {} as ComputedResults)
}
