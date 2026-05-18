import type { Organisation } from '../../../adapters/prisma/generated.ts'
import type { SelectedVerifiedUser } from '../../../adapters/prisma/selection.ts'
import { EventBusEvent } from '../../../core/event-bus/event.ts'
import { sanitizeOrganisationAdministratorName } from './event.mapper.ts'

export type OrganisationUpdatedEventAttributes = {
  organisation: Organisation & {
    administrators: Array<{ user: SelectedVerifiedUser }>
  }
  administrator?: SelectedVerifiedUser
}

export class OrganisationUpdatedEvent extends EventBusEvent<OrganisationUpdatedEventAttributes> {
  name = 'OrganisationUpdatedEvent'

  constructor(attributes: OrganisationUpdatedEventAttributes) {
    super(sanitizeOrganisationAdministratorName(attributes))
  }
}
