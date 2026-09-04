import { ComputationAlreadyExistsException } from '@nosgestesclimat/core/features/simulation-computation/exceptions/simulation-computation.exception'
import { createProgramSimulationComputation } from '@nosgestesclimat/core/features/simulation-computation/services/program-simulation-computation'
import { captureException } from '@sentry/node'
import type { Handler } from '../../../core/event-bus/handler.ts'
import logger from '../../../logger.ts'
import type { SimulationUpsertedEvent } from '../events/SimulationUpserted.event.ts'

const programSimulationComputationService = createProgramSimulationComputation({
  logger,
  captureException,
})

export const programSimulationComputation: Handler<
  SimulationUpsertedEvent
> = async ({ attributes: { simulation } }) => {
  if (simulation.progression !== 1) return

  try {
    await programSimulationComputationService(simulation.id)
  } catch (error) {
    if (error instanceof ComputationAlreadyExistsException) {
      logger.warn(error.name, { simulationId: simulation.id })
      return
    }
    throw error
  }
}
