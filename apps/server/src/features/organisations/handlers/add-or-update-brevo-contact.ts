import { addOrUpdateContactAfterOrganisationChange } from '../../../adapters/brevo/client.ts'
import { prisma } from '../../../adapters/prisma/client.ts'
import { transaction } from '../../../adapters/prisma/transaction.ts'
import type { Handler } from '../../../core/event-bus/handler.ts'
import type { OrganisationCreatedEvent } from '../events/OrganisationCreated.event.ts'
import type { OrganisationUpdatedEvent } from '../events/OrganisationUpdated.event.ts'
import type { PollCreatedEvent } from '../events/PollCreated.event.ts'
import type { PollDeletedEvent } from '../events/PollDeletedEvent.ts'
import type { PollUpdatedEvent } from '../events/PollUpdated.event.ts'
import { getLastPollParticipantsCount } from '../organisations.repository.ts'

export const addOrUpdateBrevoContact: Handler<
  | OrganisationCreatedEvent
  | OrganisationUpdatedEvent
  | PollCreatedEvent
  | PollUpdatedEvent
  | PollDeletedEvent
> = async (event) => {
  const {
    attributes: {
      organisation: {
        id: organisationId,
        name: organisationName,
        slug,
        administrators: [
          {
            user: {
              email,
              name: administratorName,
              optedInForCommunications,
              id: userId,
            },
          },
        ],
      },
    },
  } = event

  return addOrUpdateContactAfterOrganisationChange({
    slug,
    email,
    userId,
    organisationName,
    administratorName,
    optedInForCommunications,
    lastPollParticipantsCount: await transaction(
      (session) => getLastPollParticipantsCount(organisationId, { session }),
      prisma
    ),
  })
}
