import { createProgramSimulationComputation } from '@nosgestesclimat/core/features/simulation-computation/services/program-simulation-computation'
import type { Handler } from '../../../core/event-bus/handler.ts'
import { coreLogger } from '../../../logger.ts'
import type { SimulationUpsertedEvent } from '../events/SimulationUpserted.event.ts'

const programSimulationComputationService = createProgramSimulationComputation({
  logger: coreLogger,
})

export const programSimulationComputation: Handler<
  SimulationUpsertedEvent
> = async ({ attributes: { simulation } }) => {
  if (simulation.progression !== 1) return

  await programSimulationComputationService(simulation.id)
}
