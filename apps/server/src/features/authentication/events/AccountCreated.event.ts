import type { VerifiedUser } from '../../../adapters/prisma/generated.ts'
import { EventBusEvent } from '../../../core/event-bus/event.ts'
export class AccountCreatedEvent extends EventBusEvent<{
  user: Pick<VerifiedUser, 'id' | 'email'>
}> {
  name = 'AccountCreatedEvent'
}
