import type { Organisation, Poll } from '../../../adapters/prisma/generated.ts'
import type { SelectedVerifiedUser } from '../../../adapters/prisma/selection.ts'
import { EventBusEvent } from '../../../core/event-bus/event.ts'
import { sanitizeOrganisationAdministratorName } from './event.mapper.ts'

export type PollUpdatedEventAttributes = {
  organisation: Organisation & {
    administrators: Array<{ user: SelectedVerifiedUser }>
  }
  poll: Poll
}

export class PollUpdatedEvent extends EventBusEvent<PollUpdatedEventAttributes> {
  name = 'PollUpdatedEvent'

  constructor(attributes: PollUpdatedEventAttributes) {
    super(sanitizeOrganisationAdministratorName(attributes))
  }
}
