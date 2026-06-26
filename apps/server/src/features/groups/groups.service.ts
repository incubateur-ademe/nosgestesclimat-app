import { prisma } from '@nosgestesclimat/core/prisma/client'
import {
  isPrismaErrorForeignKeyConstraintFailed,
  isPrismaErrorNotFound,
} from '@nosgestesclimat/core/prisma/utils'
import type { Session } from '../../adapters/prisma/transaction.ts'
import { transaction } from '../../adapters/prisma/transaction.ts'
import { EntityNotFoundException } from '../../core/errors/EntityNotFoundException.ts'
import { ForbiddenException } from '../../core/errors/ForbiddenException.ts'
import { EventBus } from '../../core/event-bus/event-bus.ts'
import { Locales } from '../../core/i18n/constant.ts'
import type { PartialUser } from '../../core/types/user.ts'
import { SimulationUpsertedEvent } from '../simulations/events/SimulationUpserted.event.ts'
import { GroupCreatedEvent } from './events/GroupCreated.event.ts'
import { GroupDeletedEvent } from './events/GroupDeleted.event.ts'
import { GroupUpdatedEvent } from './events/GroupUpdated.event.ts'
import {
  createGroupAndUser,
  createParticipantAndUser,
  deleteParticipantById,
  deleteUserGroup,
  fetchUserGroup,
  fetchUserGroups,
  findGroupAndParticipantById,
  updateUserGroup,
} from './groups.repository.ts'
import type {
  GroupCreateDto,
  GroupParams,
  GroupParticipantParams,
  GroupsFetchQuery,
  GroupUpdateDto,
  ParticipantCreateDto,
} from './groups.validator.ts'

/**
 * Maps a database group to a dto for the UI
 */
const groupToDto = (
  group: Awaited<ReturnType<typeof createGroupAndUser>>['group'],
  connectedUser: string
) => ({
  ...group,
  administrator:
    group.administrator?.user.id === connectedUser
      ? group.administrator?.user
      : {
          name: group.administrator?.user.name,
        },
  participants: (group.participants || []).map((p) =>
    participantToDto(p, connectedUser)
  ),
})

type PopulatedParticipant = Awaited<
  ReturnType<typeof createParticipantAndUser>
>['participant']

/**
 * Maps a database participant to a dto for the UI
 */
const participantToDto = (
  {
    id,
    simulation,
    user: { id: userId, ...rest },
    createdAt,
    updatedAt,
  }: Partial<PopulatedParticipant> & {
    user: PopulatedParticipant['user']
  },
  connectedUser: string
) => ({
  ...(userId === connectedUser
    ? {
        id,
        simulation,
        userId,
        ...rest,
        createdAt,
        updatedAt,
      }
    : {
        id,
        name: rest.name,
        simulation,
      }),
})

const findGroupAndParticipant = async (
  params: GroupParticipantParams,
  { session }: { session: Session }
) => {
  try {
    return await findGroupAndParticipantById(params, { session })
  } catch (e) {
    if (isPrismaErrorNotFound(e)) {
      throw new EntityNotFoundException('Group or participant not found')
    }
    throw e
  }
}

export const createGroup = async ({
  groupDto,
  origin,
  user,
}: {
  groupDto: GroupCreateDto
  origin: string
  user: PartialUser
}) => {
  const {
    group,
    simulation,
    administrator,
    simulationUpdated,
    simulationCreated,
  } = await transaction((session) =>
    createGroupAndUser(groupDto, { user }, { session })
  )
  const { participants } = group

  const events = []

  const groupCreatedEvent = new GroupCreatedEvent({
    administrator,
    participants,
  })

  EventBus.emit(groupCreatedEvent)

  events.push(groupCreatedEvent)

  if (simulation) {
    const simulationUpsertedEvent = new SimulationUpsertedEvent({
      group,
      origin,
      simulation,
      administrator,
      sendEmail: true,
      locale: Locales.fr,
      user: administrator,
      updated: simulationUpdated,
      created: simulationCreated,
    })

    EventBus.emit(simulationUpsertedEvent)

    events.push(simulationUpsertedEvent)
  }

  await EventBus.once(...events)

  return groupToDto(group, user.id)
}

export const updateGroup = async (
  { groupId, user }: { groupId: string; user: PartialUser },
  update: GroupUpdateDto
) => {
  try {
    const group = await transaction((session) =>
      updateUserGroup({ groupId, userId: user.id }, update, { session })
    )
    const { participants } = group

    const groupUpdatedEvent = new GroupUpdatedEvent({
      administrator: group.administrator!.user,
      participants,
    })

    EventBus.emit(groupUpdatedEvent)

    await EventBus.once(groupUpdatedEvent)

    return groupToDto(group, user.id)
  } catch (e) {
    if (isPrismaErrorNotFound(e)) {
      throw new EntityNotFoundException('Group not found')
    }
    throw e
  }
}

export const createParticipant = async ({
  origin,
  params,
  participantDto,
  user,
}: {
  origin: string
  params: GroupParams
  participantDto: ParticipantCreateDto
  user: PartialUser
}) => {
  try {
    const { participant, created, simulationCreated, simulationUpdated } =
      await transaction((session) =>
        createParticipantAndUser(params, participantDto, { user }, { session })
      )
    const {
      user: participantUser,
      group,
      simulation,
      group: { participants },
    } = participant
    const administrator = group.administrator!.user

    const groupUpdatedEvent = new GroupUpdatedEvent({
      participantUser,
      administrator,
      participants,
    })

    const simulationUpsertedEvent = new SimulationUpsertedEvent({
      created: simulationCreated,
      updated: simulationUpdated,
      sendEmail: created,
      locale: Locales.fr,
      administrator,
      simulation,
      origin,
      group,
      user: participantUser,
    })

    EventBus.emit(groupUpdatedEvent).emit(simulationUpsertedEvent)

    const events = [groupUpdatedEvent, simulationUpsertedEvent]

    await EventBus.once(...events)

    return participantToDto(participant, user.id)
  } catch (e) {
    if (isPrismaErrorForeignKeyConstraintFailed(e)) {
      throw new EntityNotFoundException('Group not found')
    }
    throw e
  }
}

export const removeParticipant = async ({
  groupId,
  participantId,
  user,
}: GroupParticipantParams & {
  user: PartialUser
}) => {
  try {
    const {
      group: { participants, administrator },
      user: participantUser,
    } = await transaction(async (session) => {
      const {
        group: { administrator: admin },
        ...participant
      } = await findGroupAndParticipant({ groupId, participantId }, { session })

      const administratorId = admin?.userId
      const isConnectedUserGroupAdmin = user.id === administratorId

      if (isConnectedUserGroupAdmin && administratorId === participant.userId) {
        throw new ForbiddenException(
          'Forbidden ! Administrator cannot leave group, delete it instead.'
        )
      }

      if (!isConnectedUserGroupAdmin && user.id !== participant.userId) {
        throw new ForbiddenException(
          'Forbidden ! You cannot remove other participants from this group.'
        )
      }

      return deleteParticipantById(participantId, { session })
    })

    const groupUpdatedEvent = new GroupUpdatedEvent({
      administrator: administrator!.user,
      participantUser,
      participants,
    })

    EventBus.emit(groupUpdatedEvent)

    await EventBus.once(groupUpdatedEvent)
  } catch (e) {
    if (isPrismaErrorNotFound(e)) {
      // Participant already deleted
      return
    }
    throw e
  }
}

export const fetchGroups = async (
  user: PartialUser,
  filters: GroupsFetchQuery
) => {
  const groups = await transaction(
    (session) => fetchUserGroups({ userId: user.id }, filters, { session }),
    prisma
  )

  return groups.map((p) => groupToDto(p, user.id))
}

export const fetchGroup = async ({
  groupId,
  user,
}: {
  groupId: string
  user: PartialUser
}) => {
  try {
    const group = await transaction(
      (session) => fetchUserGroup({ groupId }, { session }),
      prisma
    )

    return groupToDto(group, user.id)
  } catch (e) {
    if (isPrismaErrorNotFound(e)) {
      throw new EntityNotFoundException('Group not found')
    }
    throw e
  }
}

export const deleteGroup = async (params: {
  userId: string
  groupId: string
}) => {
  try {
    const { administrator, participants } = await transaction((session) =>
      deleteUserGroup(params, { session })
    )

    const groupDeletedEvent = new GroupDeletedEvent({
      administrator: administrator!.user,
      participants,
    })

    EventBus.emit(groupDeletedEvent)

    await EventBus.once(groupDeletedEvent)
  } catch (e) {
    if (isPrismaErrorNotFound(e)) {
      throw new EntityNotFoundException('Group not found')
    }
    throw e
  }
}
