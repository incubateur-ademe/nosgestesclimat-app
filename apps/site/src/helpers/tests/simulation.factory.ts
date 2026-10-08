import type { Simulation } from '@/helpers/server/model/simulations'
import type { ComputedResultsFootprint } from '@/publicodes-state/types'
import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'

/** `categories` and `subcategories` are keyed by dotted name: only the engine
 * fills them, hence the cast. */
const emptyFootprint = () =>
  ({ bilan: 0, categories: {}, subcategories: {} }) as ComputedResultsFootprint

/** The simulation as the API hands it over (`model` is the serialized string,
 * where `core`'s factory builds the domain shape). Mirrors its builder API. */
class SimulationFactory extends Factory<Simulation> {
  withProgression(progression: number) {
    return this.params({ progression })
  }

  started() {
    return this.params({ progression: 0.1 })
  }

  completed() {
    return this.params({ progression: 1 })
  }
}

export const simulationFactory = SimulationFactory.define(() => ({
  id: faker.string.uuid(),
  date: new Date().toISOString(),
  situation: {},
  foldedSteps: [],
  computedResults: {
    carbone: emptyFootprint(),
    eau: emptyFootprint(),
  },
  progression: 0,
  model: 'FR-fr-1.2.3',
}))
