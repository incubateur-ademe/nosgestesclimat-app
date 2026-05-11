import type { Handler } from '../../../core/event-bus/handler.ts'
import { syncUserData } from '../../users/users.service.ts'
import type { SimulationUpsertedEvent } from '../events/SimulationUpserted.event.ts'

export const syncUserDataAfterSimulationUpserted: Handler<
  SimulationUpsertedEvent
> = ({
  attributes: {
    user: { email, id },
    verified,
  },
}) => {
  if (!email) {
    return
  }

  return syncUserData({
    user: { id, email },
    verified,
  })
}
