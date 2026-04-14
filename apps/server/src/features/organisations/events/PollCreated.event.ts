import type {
  Organisation,
  Poll,
  VerifiedUser,
} from '../../../adapters/prisma/generated.js'
import { EventBusEvent } from '../../../core/event-bus/event.js'
import type { Locales } from '../../../core/i18n/constant.js'
import { sanitizeOrganisationAdministratorName } from './event.mapper.js'

export type PollCreatedEventAttributes = {
  organisation: Organisation & { administrators: Array<{ user: VerifiedUser }> }
  locale: Locales
  origin: string
  poll: Poll
}

export class PollCreatedEvent extends EventBusEvent<PollCreatedEventAttributes> {
  name = 'PollCreatedEvent'

  constructor(attributes: PollCreatedEventAttributes) {
    super(sanitizeOrganisationAdministratorName(attributes))
  }
}
