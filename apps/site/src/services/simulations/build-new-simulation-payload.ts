import { metrics } from '@/constants/model/metric'
import type { Simulation } from '@/helpers/server/model/simulations'
import { migrateSimulation } from '@/publicodes-state/helpers/migrateSimulation'
import type {
  ComputedResults,
  ComputedResultsFootprint,
} from '@/publicodes-state/types'
import migrationInstructions from '@incubateur-ademe/nosgestesclimat/public/migration.json'
import { captureException } from '@sentry/nextjs'
import { v4 as uuidv4 } from 'uuid'

/**
 * Builds the body of a simulation about to be persisted.
 *
 * Server-only on purpose: a simulation exists once the API has stored it, so
 * nothing client-side may construct one. `model` can only be resolved
 * server-side anyway (the region lives in an httpOnly cookie) — see
 * `resolveNewSimulationModelString()`.
 *
 * Any caller-supplied situation is migrated before being persisted, so legacy
 * rule names and the single-metric `computedResults` shape never reach the API.
 */
export function buildNewSimulationPayload({
  id = uuidv4(),
  date = new Date().toISOString(),
  situation = {},
  foldedSteps = [],
  persona,
  computedResults = metrics.reduce((acc, metric) => {
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
  progression = 0,
  polls,
  groups,
  model,
}: Partial<Omit<Simulation, 'model'>> & { model: string }): Simulation {
  const simulation: Simulation = {
    id,
    date,
    situation,
    foldedSteps,
    persona,
    computedResults,
    progression,
    polls,
    groups,
    model,
  }

  try {
    return migrateSimulation(simulation, migrationInstructions)
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('Error trying to migrate Simulation:', error)
    captureException(error)
    return simulation
  }
}
