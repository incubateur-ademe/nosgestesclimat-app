import type { Organisation } from '../../../adapters/prisma/generated.ts'
import { EventBusEvent } from '../../../core/event-bus/event.ts'
import type { VerifiedUser } from '../../../core/types/verified-user.ts'
import { sanitizeOrganisationAdministratorName } from './event.mapper.ts'

export type OrganisationUpdatedEventAttributes = {
  organisation: Organisation & {
    administrators: Array<{ user: VerifiedUser }>
  }
  administrator?: VerifiedUser
}

export class OrganisationUpdatedEvent extends EventBusEvent<OrganisationUpdatedEventAttributes> {
  name = 'OrganisationUpdatedEvent'

  constructor(attributes: OrganisationUpdatedEventAttributes) {
    super(sanitizeOrganisationAdministratorName(attributes))
  }
}
