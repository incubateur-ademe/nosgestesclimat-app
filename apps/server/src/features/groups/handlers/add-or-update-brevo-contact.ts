import {
  addOrUpdateAdministratorContactAfterGroupChange,
  addOrUpdateParticipantContactAfterGroupChange,
} from '../../../adapters/brevo/client.ts'
import { prisma } from '../../../adapters/prisma/client.ts'
import { transaction } from '../../../adapters/prisma/transaction.ts'
import type { Handler } from '../../../core/event-bus/handler.ts'
import type { GroupCreatedEvent } from '../events/GroupCreated.event.ts'
import { GroupDeletedEvent } from '../events/GroupDeleted.event.ts'
import type { GroupUpdatedEvent } from '../events/GroupUpdated.event.ts'
import {
  getAdministratorGroupsStats,
  getGroupsJoinedCount,
} from '../groups.repository.ts'

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
