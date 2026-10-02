import { parseModelString } from '@/helpers/server/model/models'
import type { Simulation } from '@/helpers/server/model/simulations'
import type { Logger } from '@nosgestesclimat/core/features/logger/index'
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
 *
 * The line takes the caller's logger, and with it the action's scope: the
 * repair is part of that action, not a unit of its own.
 */
export async function ensureSimulationModel<
  Payload extends { id: Simulation['id']; model?: Simulation['model'] },
>(
  simulation: Payload,
  logger: Logger
): Promise<Payload & { model: Simulation['model'] }> {
  if (hasValidModel(simulation)) {
    return simulation
  }

  logger.error(
    new Error('Simulation reached persistence without a valid model'),
    {
      simulationId: simulation.id,
      model: simulation.model,
    }
  )

  return { ...simulation, model: await resolveNewSimulationModelString() }
}

function hasValidModel<Payload extends { model?: Simulation['model'] }>(
  simulation: Payload
): simulation is Payload & { model: Simulation['model'] } {
  return !!simulation.model && !!parseModelString(simulation.model)
}
