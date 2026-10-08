import { parseModelString } from '@/helpers/server/model/models'
import type { Simulation } from '@/helpers/server/model/simulations'
import type { Logger } from '@nosgestesclimat/core/features/logger/index'
import { resolveNewSimulationModelString } from './resolve-new-simulation-model'

/** Repairs simulations without a valid model before persisting. The database
 * default (`FR-fr-0.0.0`) makes them uncomputable. Uses the caller's logger
 * so the repair is part of the action's scope. */
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
