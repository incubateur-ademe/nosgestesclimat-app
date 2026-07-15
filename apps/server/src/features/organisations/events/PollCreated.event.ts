import type {
  Organisation,
  Poll,
  VerifiedUser,
} from '../../../adapters/prisma/generated.ts'
import { EventBusEvent } from '../../../core/event-bus/event.ts'
import type { Locales } from '../../../core/i18n/constant.ts'
import { sanitizeOrganisationAdministratorName } from './event.mapper.ts'

export type PollCreatedEventAttributes = {
  organisation: Organisation & {
    administrators: Array<{ user: VerifiedUser }>
  }
  locale: Locales
  poll: Poll
}

export class PollCreatedEvent extends EventBusEvent<PollCreatedEventAttributes> {
  name = 'PollCreatedEvent'

  constructor(attributes: PollCreatedEventAttributes) {
    super(sanitizeOrganisationAdministratorName(attributes))
  }
}
