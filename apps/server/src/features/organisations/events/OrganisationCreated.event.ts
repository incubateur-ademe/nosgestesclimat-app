import type { Organisation } from '../../../adapters/prisma/generated.ts'
import { EventBusEvent } from '../../../core/event-bus/event.ts'
import type { Locales } from '../../../core/i18n/constant.ts'
import type { VerifiedUser } from '../../../core/types/verified-user.ts'
import { sanitizeOrganisationAdministratorName } from './event.mapper.ts'

export type OrganisationCreatedEventAttributes = {
  organisation: Organisation & {
    administrators: Array<{ user: VerifiedUser }>
  }
  administrator: VerifiedUser
  locale: Locales
  origin: string
}

export class OrganisationCreatedEvent extends EventBusEvent<OrganisationCreatedEventAttributes> {
  name = 'OrganisationCreatedEvent'

  constructor(attributes: OrganisationCreatedEventAttributes) {
    super(sanitizeOrganisationAdministratorName(attributes))
  }
}
