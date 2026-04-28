import type { User } from '../../../adapters/prisma/generated.js'
import { EventBusEvent } from '../../../core/event-bus/event.js'

export class GroupDeletedEvent extends EventBusEvent<{
  administrator: Pick<User, 'id' | 'name' | 'email'>
  participants: Array<{ user: Pick<User, 'id' | 'email'> | null }>
  participantUser?: undefined
}> {
  name = 'GroupDeletedEvent'
}
