import { parseModelString } from '@/helpers/server/model/models'
import type { Simulation } from '@/helpers/server/model/simulations'
import logger from '@/logger.server'
import { resolveNewSimulationModelString } from './resolve-new-simulation-model'

/**
 * Last line of defence before a simulation is persisted.
 *
 * A simulation without a valid model is stored with the `FR-fr-0.0.0` database
 * default and is then never computed. The type system prevents that at creation
 * time, but simulations also come from long-lived client state, so we repair —
 * and report — anything that slipped through.
 *
 * Server actions run current server code even for stale browser tabs, which is
 * what makes repairing here reliable.
 */
export async function ensureSimulationModel<
  Payload extends { id: Simulation['id']; model?: Simulation['model'] },
>(simulation: Payload): Promise<Payload> {
  if (simulation.model && parseModelString(simulation.model)) {
    return simulation
  }

  // Repaired here, but the simulation would never have been computed: the
  // caller reached persistence with a broken model string, which no scenario
  // tolerates.
  logger.error(
    new Error('Simulation reached persistence without a valid model'),
    {
      component: 'site.service.ensureSimulationModel',
      simulationId: simulation.id,
      model: simulation.model,
    }
  )

  return { ...simulation, model: await resolveNewSimulationModelString() }
}
