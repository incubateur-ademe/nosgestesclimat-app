import type { Organisation } from '../../../adapters/prisma/generated.ts'
import type { SelectedVerifiedUser } from '../../../adapters/prisma/selection.ts'
import { EventBusEvent } from '../../../core/event-bus/event.ts'
import { sanitizeOrganisationAdministratorName } from './event.mapper.ts'

export type PollDeletedEventAttributes = {
  organisation: Organisation & {
    administrators: Array<{ user: SelectedVerifiedUser }>
  }
}

export class PollDeletedEvent extends EventBusEvent<PollDeletedEventAttributes> {
  name = 'PollDeletedEvent'

  constructor(attributes: PollDeletedEventAttributes) {
    super(sanitizeOrganisationAdministratorName(attributes))
  }
}
