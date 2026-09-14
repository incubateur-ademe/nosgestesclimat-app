import { Factory } from 'fishery'
import type { ComputedResults } from '../validators/computed-results.schema.ts'

/**
 * `computedResults` is a value object embedded as JSON in both `Simulation` and
 * `Poll`: it has no table of its own, hence a build-only factory. No `onCreate`
 * is declared on purpose, so calling `create` on it throws.
 */
class ComputedResultsFactory extends Factory<ComputedResults> {
  /**
   * A populated footprint, as a simulation or a poll exposes it once results
   * have been computed.
   */
  valid() {
    return this.params({
      carbone: {
        bilan: 1000,
        categories: {
          alimentation: 300,
          transport: 400,
          logement: 200,
          divers: 50,
          'services sociétaux': 50,
        },
      },
      eau: {
        bilan: 500,
        categories: {
          alimentation: 150,
          transport: 200,
          logement: 100,
          divers: 25,
          'services sociétaux': 25,
        },
      },
    })
  }

  withCarboneBilan(bilan: number) {
    return this.params({ carbone: { bilan } })
  }

  withEauBilan(bilan: number) {
    return this.params({ eau: { bilan } })
  }
}

export const computedResultsFactory = ComputedResultsFactory.define(() => ({
  carbone: {
    bilan: 0,
    categories: zeroedCategories(),
    subcategories: {},
  },
  eau: {
    bilan: 0,
    categories: zeroedCategories(),
    subcategories: {},
  },
}))

/**
 * The pre carbone/eau shape still found in database for legacy simulations. It
 * does not satisfy `ComputedResults`, so it cannot be a state of the factory
 * above and stays a cast literal.
 */
export const deprecatedComputedResults = {
  bilan: 1000,
} as unknown as ComputedResults

const zeroedCategories = () => ({
  alimentation: 0,
  transport: 0,
  logement: 0,
  divers: 0,
  'services sociétaux': 0,
})
