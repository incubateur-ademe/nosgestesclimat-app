import type {
  Organisation,
  VerifiedUser,
} from '../../../adapters/prisma/generated.js'
import { EventBusEvent } from '../../../core/event-bus/event.js'
import { sanitizeOrganisationAdministratorName } from './event.mapper.js'

export type PollDeletedEventAttributes = {
  organisation: Organisation & { administrators: Array<{ user: VerifiedUser }> }
}

export class PollDeletedEvent extends EventBusEvent<PollDeletedEventAttributes> {
  name = 'PollDeletedEvent'

  constructor(attributes: PollDeletedEventAttributes) {
    super(sanitizeOrganisationAdministratorName(attributes))
  }
}
