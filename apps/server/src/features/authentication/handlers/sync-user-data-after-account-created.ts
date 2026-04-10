import type { AccountCreatedEvent } from '../events/AccountCreated.event.js'
import type { Handler } from '../../../core/event-bus/handler.js'
import { syncUserData } from '../../users/users.service.js'

export const syncUserDataAfterAccountCreated: Handler<AccountCreatedEvent> = ({
  attributes: { user },
}) => {
  return syncUserData({ user, verified: true })
}
