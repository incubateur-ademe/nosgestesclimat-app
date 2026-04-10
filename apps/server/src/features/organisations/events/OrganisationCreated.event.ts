import type {
  Organisation,
  VerifiedUser,
} from '../../../adapters/prisma/generated.js'
import { EventBusEvent } from '../../../core/event-bus/event.js'
import type { Locales } from '../../../core/i18n/constant.js'
import { sanitizeOrganisationAdministratorName } from './event.mapper.js'

export type OrganisationCreatedEventAttributes = {
  organisation: Organisation & { administrators: Array<{ user: VerifiedUser }> }
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
