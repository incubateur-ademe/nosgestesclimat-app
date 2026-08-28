import migrationInstructions from '@incubateur-ademe/nosgestesclimat/public/migration.json' with { type: 'json' }
import { migrateSituation } from '@publicodes/tools/migration'
import { CURRENT_MODEL_VERSION } from '../../simulation-computation/model-support/model-versions.ts'
import type { Simulation } from '../types/simulation.ts'

/**
 * Migrates a simulation's situation forward to the current model version when
 * the simulation was created with an older published model. PR-based
 * simulations and simulations already on the current version are returned
 * unchanged. The situation is mutated in place.
 */
export function migrateSimulationIfNeeded(simulation: Simulation): Simulation {
  const { version } = simulation.model
  if ('PRNumber' in version) {
    return simulation
  }
  if (version.publishedTag === CURRENT_MODEL_VERSION) {
    return simulation
  }
  simulation.situation = migrateSituation(
    simulation.situation,
    migrationInstructions
  )
  return simulation
}
