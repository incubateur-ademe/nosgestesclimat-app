import type { Organisation, Poll } from '../../../adapters/prisma/generated.ts'
import { EventBusEvent } from '../../../core/event-bus/event.ts'
import type { VerifiedUser } from '../../../core/types/verified-user.ts'
import { sanitizeOrganisationAdministratorName } from './event.mapper.ts'

export type PollUpdatedEventAttributes = {
  organisation: Organisation & {
    administrators: Array<{ user: VerifiedUser }>
  }
  poll: Poll
}

export class PollUpdatedEvent extends EventBusEvent<PollUpdatedEventAttributes> {
  name = 'PollUpdatedEvent'

  constructor(attributes: PollUpdatedEventAttributes) {
    super(sanitizeOrganisationAdministratorName(attributes))
  }
}
