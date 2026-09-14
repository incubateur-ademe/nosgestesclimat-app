import type { ComputedResults } from '../validators/computed-results.schema.ts'

const emptyMetric = () => ({
  bilan: 0,
  categories: {
    transport: 0,
    alimentation: 0,
    logement: 0,
    divers: 0,
    'services sociétaux': 0,
  },
  subcategories: {},
})

/**
 * The `computedResults` a simulation is born with. A zeroed footprint is what
 * distinguishes a pristine simulation from an answered one, which is why
 * writing zeroes over real answers is refused everywhere else.
 *
 * Returns a fresh object: the value is persisted as JSON and must not be
 * shared between simulations.
 */
export const emptyComputedResults = (): ComputedResults => ({
  carbone: emptyMetric(),
  eau: emptyMetric(),
})
