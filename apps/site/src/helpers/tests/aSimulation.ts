import { metrics } from '@/constants/model/metric'
import type { Simulation } from '@/helpers/server/model/simulations'
import type {
  ComputedResults,
  ComputedResultsFootprint,
} from '@/publicodes-state/types'
import { v4 as randomUUID } from 'uuid'

/**
 * A simulation shaped like the ones the API returns. `computedResults` carries
 * every metric: a partial one would not be a `ComputedResults` at all, and the
 * components under test read it as one.
 */
export function aSimulation(overrides: Partial<Simulation> = {}): Simulation {
  return {
    id: randomUUID(),
    date: new Date().toISOString(),
    situation: {},
    foldedSteps: [],
    computedResults: metrics.reduce((acc, metric) => {
      acc[metric] = {
        bilan: 0,
        categories: {},
        subcategories: {},
      } as ComputedResultsFootprint
      return acc
    }, {} as ComputedResults),
    progression: 0,
    model: 'FR-fr-1.2.3',
    ...overrides,
  }
}
