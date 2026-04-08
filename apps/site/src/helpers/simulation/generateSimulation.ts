import { metrics } from '@/constants/model/metric'
import type { Simulation } from '@/helpers/server/model/simulations'
import { migrateSimulation } from '@/publicodes-state/helpers/migrateSimulation'
import type {
  ComputedResults,
  ComputedResultsFootprint,
} from '@/publicodes-state/types'
import type { Migration } from '@publicodes/tools/migration'
import { captureException } from '@sentry/nextjs'
import { v4 as uuidv4 } from 'uuid'
import { getInitialExtendedSituation } from '../modelFetching/getInitialExtendedSituation'

export function generateSimulation({
  id = uuidv4(),
  date = new Date().toISOString(),
  situation = {},
  extendedSituation = getInitialExtendedSituation(),
  foldedSteps = [],
  actionChoices = {},
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
  migrationInstructions,
  model,
}: Partial<Simulation> & {
  migrationInstructions?: Migration
} = {}): Simulation {
  let simulation = {
    id,
    date,
    situation,
    foldedSteps,
    extendedSituation,
    actionChoices,
    persona,
    computedResults,
    progression,
    polls,
    groups,
    model,
  } as Simulation

  try {
    simulation = migrateSimulation(simulation, migrationInstructions)
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('Error trying to migrate Simulation:', error)
    captureException(error)
  }

  return simulation
}
