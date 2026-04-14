import {
  addOrUpdateAdministratorContactAfterGroupChange,
  addOrUpdateParticipantContactAfterGroupChange,
} from '../../../adapters/brevo/client.js'
import { prisma } from '../../../adapters/prisma/client.js'
import { transaction } from '../../../adapters/prisma/transaction.js'
import type { Handler } from '../../../core/event-bus/handler.js'
import type { GroupCreatedEvent } from '../events/GroupCreated.event.js'
import { GroupDeletedEvent } from '../events/GroupDeleted.event.js'
import type { GroupUpdatedEvent } from '../events/GroupUpdated.event.js'
import {
  getAdministratorGroupsStats,
  getGroupsJoinedCount,
} from '../groups.repository.js'

export const addOrUpdateBrevoAdministratorContact: Handler<
  GroupCreatedEvent | GroupUpdatedEvent | GroupDeletedEvent
> = async ({
  attributes: {
    administrator: { email, id, name },
    participants,
    participantUser,
  },
}) => {
  const administratorHasJoined = participants?.some(
    ({ user }) => user.id === id
  )
  const isAdministrator = participantUser?.id === id

  if (!email || (!administratorHasJoined && !isAdministrator)) {
    return
  }

  return addOrUpdateAdministratorContactAfterGroupChange({
    email,
    userId: id,
    administratorName: name,
    ...(await transaction(
      (session) => getAdministratorGroupsStats(id, { session }),
      prisma
    )),
  })
}

export const addOrUpdateBrevoParticipantContact: Handler<
  GroupUpdatedEvent | GroupDeletedEvent
> = async (event) => {
  const {
    attributes: {
      administrator: { id: administratorId },
      participants,
      participantUser,
    },
  } = event
  const unsubscriptions = []

  if (event instanceof GroupDeletedEvent) {
    unsubscriptions.push(...participants.map(({ user }) => user))
  }

  if (participantUser?.email) {
    unsubscriptions.push(participantUser)
  }

  for (const participant of unsubscriptions) {
    const { email, id: participantId } = participant
    if (email && participantId !== administratorId) {
      await addOrUpdateParticipantContactAfterGroupChange({
        email,
        joinedGroupsCount: await transaction((session) =>
          getGroupsJoinedCount(participantId, { session })
        ),
      })
    }
  }
}
