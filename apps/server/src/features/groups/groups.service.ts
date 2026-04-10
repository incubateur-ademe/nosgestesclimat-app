import { prisma } from '../../adapters/prisma/client.js'
import type { Session } from '../../adapters/prisma/transaction.js'
import { transaction } from '../../adapters/prisma/transaction.js'
import { EntityNotFoundException } from '../../core/errors/EntityNotFoundException.js'
import { ForbiddenException } from '../../core/errors/ForbiddenException.js'
import { EventBus } from '../../core/event-bus/event-bus.js'
import { Locales } from '../../core/i18n/constant.js'
import {
  isPrismaErrorForeignKeyConstraintFailed,
  isPrismaErrorNotFound,
} from '../../core/typeguards/isPrismaError.js'
import { SimulationUpsertedEvent } from '../simulations/events/SimulationUpserted.event.js'
import type { UserParams } from '../users/users.validator.js'
import { GroupCreatedEvent } from './events/GroupCreated.event.js'
import { GroupDeletedEvent } from './events/GroupDeleted.event.js'
import { GroupUpdatedEvent } from './events/GroupUpdated.event.js'
import {
  createGroupAndUser,
  createParticipantAndUser,
  deleteParticipantById,
  deleteUserGroup,
  fetchUserGroup,
  fetchUserGroups,
  findGroupAndParticipantById,
  updateUserGroup,
} from './groups.repository.js'
import type {
  GroupCreateDto,
  GroupParams,
  GroupsFetchQuery,
  GroupUpdateDto,
  ParticipantCreateDto,
  UserGroupParams,
  UserGroupParticipantParams,
} from './groups.validator.js'

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
  }: Partial<PopulatedParticipant> & { user: PopulatedParticipant['user'] },
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
  params: UserGroupParticipantParams,
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
}: {
  groupDto: GroupCreateDto
  origin: string
}) => {
  const {
    group,
    simulation,
    administrator,
    simulationUpdated,
    simulationCreated,
  } = await transaction((session) => createGroupAndUser(groupDto, { session }))
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

  return groupToDto(group, groupDto.administrator.userId)
}

export const updateGroup = async (
  params: UserGroupParams,
  update: GroupUpdateDto
) => {
  try {
    const group = await transaction((session) =>
      updateUserGroup(params, update, { session })
    )
    const { participants } = group

    const groupUpdatedEvent = new GroupUpdatedEvent({
      administrator: group.administrator!.user,
      participants,
    })

    EventBus.emit(groupUpdatedEvent)

    await EventBus.once(groupUpdatedEvent)

    return groupToDto(group, params.userId)
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
}: {
  origin: string
  params: GroupParams
  participantDto: ParticipantCreateDto
}) => {
  try {
    const { participant, created, simulationCreated, simulationUpdated } =
      await transaction((session) =>
        createParticipantAndUser(params, participantDto, { session })
      )
    const {
      user,
      group,
      simulation,
      group: { participants },
    } = participant
    const administrator = group.administrator!.user

    const groupUpdatedEvent = new GroupUpdatedEvent({
      participantUser: user,
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
      user,
    })

    EventBus.emit(groupUpdatedEvent).emit(simulationUpsertedEvent)

    const events = [groupUpdatedEvent, simulationUpsertedEvent]

    await EventBus.once(...events)

    return participantToDto(participant, participantDto.userId)
  } catch (e) {
    if (isPrismaErrorForeignKeyConstraintFailed(e)) {
      throw new EntityNotFoundException('Group not found')
    }
    throw e
  }
}

export const removeParticipant = async (params: UserGroupParticipantParams) => {
  try {
    const {
      group: { participants, administrator },
      user: participantUser,
    } = await transaction(async (session) => {
      const {
        group: { administrator: admin },
        ...participant
      } = await findGroupAndParticipant(params, { session })

      const administratorId = admin?.userId
      const isConnectedUserGroupAdmin = params.userId === administratorId

      if (isConnectedUserGroupAdmin && administratorId === participant.userId) {
        throw new ForbiddenException(
          'Forbidden ! Administrator cannot leave group, delete it instead.'
        )
      }

      if (!isConnectedUserGroupAdmin && params.userId !== participant.userId) {
        throw new ForbiddenException(
          'Forbidden ! You cannot remove other participants from this group.'
        )
      }

      return deleteParticipantById(params.participantId, { session })
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
  params: UserParams,
  filters: GroupsFetchQuery
) => {
  const groups = await transaction(
    (session) => fetchUserGroups(params, filters, { session }),
    prisma
  )

  return groups.map((p) => groupToDto(p, params.userId))
}

export const fetchGroup = async (params: UserGroupParams) => {
  try {
    const group = await transaction(
      (session) => fetchUserGroup(params, { session }),
      prisma
    )

    return groupToDto(group, params.userId)
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
