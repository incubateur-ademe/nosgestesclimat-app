import { programSimulationComputation } from '@nosgestesclimat/core/features/publicodes-computation/services/simulation-computation.service'
import type { Handler } from '../../../core/event-bus/handler.ts'
import type { SimulationUpsertedEvent } from '../events/SimulationUpserted.event.ts'

export const programComputation: Handler<SimulationUpsertedEvent> = async ({
  attributes: { simulation },
}) => {
  if (simulation.progression === 1) {
    await programSimulationComputation(simulation.id)
  }
}
