import type { VerifiedUser } from '../../../adapters/prisma/generated.js'
import { EventBusEvent } from '../../../core/event-bus/event.js'
export class AccountCreatedEvent extends EventBusEvent<{
  user: Pick<VerifiedUser, 'id' | 'email'>
}> {
  name = 'AccountCreatedEvent'
}
