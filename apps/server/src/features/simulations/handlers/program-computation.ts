import { ComputationAlreadyExists } from '@nosgestesclimat/core/features/simulation-computation/exceptions/simulation-computation.exception'
import { programSimulationComputation } from '@nosgestesclimat/core/features/simulation-computation/services/program-simulation-computation'
import type { Handler } from '../../../core/event-bus/handler.ts'
import logger from '../../../logger.ts'
import type { SimulationUpsertedEvent } from '../events/SimulationUpserted.event.ts'

export const programComputation: Handler<SimulationUpsertedEvent> = async ({
  attributes: { simulation },
}) => {
  if (simulation.progression !== 1) return

  try {
    await programSimulationComputation(simulation.id)
  } catch (error) {
    if (error instanceof ComputationAlreadyExists) {
      logger.warn(error.name, { simulationId: simulation.id })
      return
    }
    throw error
  }
}
