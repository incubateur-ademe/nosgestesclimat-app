import { addOrUpdateContactAfterOrganisationChange } from '../../../adapters/brevo/client.js'
import { prisma } from '../../../adapters/prisma/client.js'
import { transaction } from '../../../adapters/prisma/transaction.js'
import type { Handler } from '../../../core/event-bus/handler.js'
import type { OrganisationCreatedEvent } from '../events/OrganisationCreated.event.js'
import type { OrganisationUpdatedEvent } from '../events/OrganisationUpdated.event.js'
import type { PollCreatedEvent } from '../events/PollCreated.event.js'
import type { PollDeletedEvent } from '../events/PollDeletedEvent.js'
import type { PollUpdatedEvent } from '../events/PollUpdated.event.js'
import { getLastPollParticipantsCount } from '../organisations.repository.js'

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
