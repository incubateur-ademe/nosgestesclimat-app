import type { SelectedVerifiedUser } from '../../../adapters/prisma/selection.ts'
import type { OrganisationCreatedEventAttributes } from './OrganisationCreated.event.ts'
import type { OrganisationUpdatedEventAttributes } from './OrganisationUpdated.event.ts'
import type { PollCreatedEventAttributes } from './PollCreated.event.ts'
import type { PollDeletedEventAttributes } from './PollDeletedEvent.ts'
import type { PollUpdatedEventAttributes } from './PollUpdated.event.ts'

type OrganisationEventAttributes =
  | OrganisationCreatedEventAttributes
  | OrganisationUpdatedEventAttributes

type PollEventAttributes = { administrator?: undefined } & (
  | PollCreatedEventAttributes
  | PollDeletedEventAttributes
  | PollUpdatedEventAttributes
)

const ADMINISTRATOR_SEPARATOR = '\n_\n'

const sanitizeName = (user?: SelectedVerifiedUser) => {
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
