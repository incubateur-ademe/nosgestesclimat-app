import type { Simulation } from '@/helpers/server/model/simulations'
import type { ComputedResultsFootprint } from '@/publicodes-state/types'
import { faker } from '@faker-js/faker'
import type { ModelString } from '@nosgestesclimat/core/features/models/helpers/model-versions'
import { Factory } from 'fishery'

/** `categories` and `subcategories` are keyed by dotted name: only the engine
 * fills them, hence the cast. */
const emptyFootprint = () =>
  ({ bilan: 0, categories: {}, subcategories: {} }) as ComputedResultsFootprint

/** The simulation as the API hands it over (`model` is the serialized string,
 * where `core`'s factory builds the domain shape). Mirrors its builder API. */
class SimulationFactory extends Factory<Simulation> {
  withStatus(status: Simulation['status']) {
    return this.params({ status })
  }

  started() {
    return this.params({ status: 'answering_major_questions' })
  }

  completed() {
    return this.params({ status: 'full_result_seen' })
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
  status: 'not_started' as const,
  model: 'FR-fr-1.2.3' as ModelString,
}))
