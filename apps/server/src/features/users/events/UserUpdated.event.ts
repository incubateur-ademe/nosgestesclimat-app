import type { BrevoContact } from '../../../adapters/brevo/client.ts'
import type { User } from '../../../adapters/prisma/generated.ts'
import { EventBusEvent } from '../../../core/event-bus/event.ts'

export class UserUpdatedEvent extends EventBusEvent<{
  user: Pick<User, 'id' | 'name' | 'email'>
  origin: string
  previousContact?: BrevoContact
  nextEmail?: string | null
  verified?: boolean
}> {
  name = 'UserUpdatedEvent'
}
