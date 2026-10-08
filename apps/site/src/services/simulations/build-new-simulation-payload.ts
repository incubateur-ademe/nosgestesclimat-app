import { metrics } from '@/constants/model/metric'
import type { Simulation } from '@/helpers/server/model/simulations'
import type {
  ComputedResults,
  ComputedResultsFootprint,
} from '@/publicodes-state/types'
import { v4 as uuidv4 } from 'uuid'
import { resolveNewSimulationModelString } from './resolve-new-simulation-model'

/** Builds a new simulation payload for persistence. Server-only: `model` needs
 * the region from an httpOnly cookie. No migration — legacy state never lands
 * here. */
export async function buildNewSimulationPayload(): Promise<Simulation> {
  return {
    id: uuidv4(),
    date: new Date().toISOString(),
    situation: {},
    foldedSteps: [],
    computedResults: metrics.reduce((acc, metric) => {
      acc[metric] = {
        bilan: 0,
        categories: {
          transport: 0,
          alimentation: 0,
          logement: 0,
          divers: 0,
          'services sociétaux': 0,
        },
        subcategories: {},
      } as ComputedResultsFootprint
      return acc
    }, {} as ComputedResults),
    progression: 0,
    model: await resolveNewSimulationModelString(),
  }
}
