import type { User } from '../../../adapters/prisma/generated.ts'
import { EventBusEvent } from '../../../core/event-bus/event.ts'

export class GroupCreatedEvent extends EventBusEvent<{
  administrator: Pick<User, 'id' | 'name' | 'email'>
  participants: Array<{ user: Pick<User, 'id' | 'email'> }>
  participantUser?: undefined
}> {
  name = 'GroupCreatedEvent'
}
