import type { Handler } from '../../../core/event-bus/handler.js'
import { updatePollStatsAfterSimulationChange } from '../../organisations/organisations.service.js'
import type { SimulationUpsertedAsyncEvent } from '../events/SimulationUpserted.event.js'

export const computePollStats: Handler<SimulationUpsertedAsyncEvent> = ({
  attributes: { simulation, created },
}) => {
  if (simulation.progression !== 1) {
    return
  }

  return updatePollStatsAfterSimulationChange({ simulation, created })
}
