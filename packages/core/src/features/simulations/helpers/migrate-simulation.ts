import migrationInstructions from '@incubateur-ademe/nosgestesclimat/public/migration.json' with { type: 'json' }
import { migrateSituation } from '@publicodes/tools/migration'
import { CURRENT_MODEL_VERSION } from '../../simulation-computation/model-support/model-versions.ts'
import type { Model, Simulation } from '../types/simulation.ts'

/**
 * Brings a simulation forward to the current model version when it was
 * created with an older published model: the situation is migrated to the
 * current dotted names and the model version is bumped to match, keeping the
 * (situation, model) pair coherent. The version bump also makes the
 * simulation's rules loadable — a migrated situation evaluated against the
 * old model's rules would silently drop the renamed answers.
 *
 * PR-based simulations and simulations already on the current version are
 * returned unchanged. The simulation is mutated in place.
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
  simulation.model = migratedModel(simulation.model)
  return simulation
}

const migratedModel = (model: Model): Model => ({
  ...model,
  version: { publishedTag: CURRENT_MODEL_VERSION },
})
