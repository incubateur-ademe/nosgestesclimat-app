import type { VerifiedUser } from '../../../adapters/prisma/generated.js'
import type { OrganisationCreatedEventAttributes } from './OrganisationCreated.event.js'
import type { OrganisationUpdatedEventAttributes } from './OrganisationUpdated.event.js'
import type { PollCreatedEventAttributes } from './PollCreated.event.js'
import type { PollDeletedEventAttributes } from './PollDeletedEvent.js'
import type { PollUpdatedEventAttributes } from './PollUpdated.event.js'

type OrganisationEventAttributes =
  | OrganisationCreatedEventAttributes
  | OrganisationUpdatedEventAttributes

type PollEventAttributes = { administrator?: undefined } & (
  | PollCreatedEventAttributes
  | PollDeletedEventAttributes
  | PollUpdatedEventAttributes
)

const ADMINISTRATOR_SEPARATOR = '\n_\n'

const sanitizeName = (user?: VerifiedUser) => {
  if (user?.name) {
    user.name = user.name.split(ADMINISTRATOR_SEPARATOR).join(' ')
  }
}

export const sanitizeOrganisationAdministratorName = <
  T extends OrganisationEventAttributes | PollEventAttributes,
>(
  eventAttributes: T
): T => {
  const {
    organisation: { administrators },
    administrator,
  } = eventAttributes

  ;[administrator, ...administrators.map(({ user }) => user)].forEach((user) =>
    sanitizeName(user)
  )

  return eventAttributes
}
