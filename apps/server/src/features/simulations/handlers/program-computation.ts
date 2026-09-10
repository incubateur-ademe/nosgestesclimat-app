import { createProgramSimulationComputation } from '@nosgestesclimat/core/features/simulation-computation/services/program-simulation-computation'
import { captureException } from '@sentry/node'
import type { Handler } from '../../../core/event-bus/handler.ts'
import logger from '../../../logger.ts'
import type { SimulationUpsertedEvent } from '../events/SimulationUpserted.event.ts'

const programSimulationComputation = createProgramSimulationComputation({
  logger,
  captureException,
})

export const programComputation: Handler<SimulationUpsertedEvent> = async ({
  attributes: { simulation },
}) => {
  if (simulation.progression !== 1) return

  await programSimulationComputation(simulation.id)
}
