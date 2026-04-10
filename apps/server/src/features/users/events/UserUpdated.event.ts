import type { User } from '../../../adapters/prisma/generated.js'
import type { BrevoContact } from '../../../adapters/brevo/client.js'
import { EventBusEvent } from '../../../core/event-bus/event.js'

export class UserUpdatedEvent extends EventBusEvent<{
  user: Pick<User, 'id' | 'name' | 'email'>
  origin: string
  previousContact?: BrevoContact
  nextEmail?: string | null
  verified?: boolean
}> {
  name = 'UserUpdatedEvent'
}
