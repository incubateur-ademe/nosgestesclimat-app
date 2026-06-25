import {
  defaultGroupParticipantSelection,
  defaultGroupSelection,
  defaultUserSelection,
  simulationSelectionWithPolls,
} from '../../adapters/prisma/selection.ts'
import type { Session } from '../../adapters/prisma/transaction.ts'
import { createParticipantSimulation } from '../simulations/simulations.repository.ts'
import { createOrUpdateUser } from '../users/users.repository.ts'
import type {
  GroupCreateDto,
  GroupParams,
  GroupParticipantParams,
  GroupsFetchQuery,
  GroupUpdateDto,
  ParticipantCreateDto,
  UserGroupParams,
} from './groups.validator.ts'

export const createGroupAndUser = async (
  {
    name: groupName,
    emoji,
    administrator: { userId, name, email },
    participants,
  }: GroupCreateDto,
  { session }: { session: Session }
) => {
  // upsert administrator
  const { user: administrator } = await createOrUpdateUser(
    {
      id: userId,
      user: {
        name,
        email,
      },
      select: defaultUserSelection,
    },
    { session }
  )

  const [participantDto] = participants || []

  let simulationUpdated = false
  let simulationCreated = false
  let simulation

  if (participantDto?.simulation) {
    ;({
      updated: simulationUpdated,
      created: simulationCreated,
      simulation,
    } = await createParticipantSimulation(
      {
        userId,
        simulation: participantDto.simulation,
      },
      { session }
    ))
  }

  const group = await session.group.create({
    data: {
      name: groupName,
      emoji,
      administrator: {
        create: {
          userId,
        },
      },
      ...(simulation
        ? {
            participants: {
              create: {
                userId,
                simulationId: simulation.id,
              },
            },
          }
        : {}),
    },
    select: {
      ...defaultGroupSelection,
      participants: {
        select: {
          ...defaultGroupParticipantSelection,
          simulation: {
            select: {
              ...simulationSelectionWithPolls,
            },
          },
        },
      },
    },
  })

  return {
    simulationUpdated,
    simulationCreated,
    administrator,
    simulation,
    group,
  }
}

export const updateUserGroup = (
  { groupId, userId }: UserGroupParams,
  update: GroupUpdateDto,
  { session }: { session: Session }
) => {
  return session.group.update({
    where: {
      id: groupId,
      administrator: {
        userId,
      },
    },
    data: update,
    select: {
      ...defaultGroupSelection,
      participants: {
        select: {
          ...defaultGroupParticipantSelection,
          simulation: {
            select: {
              ...simulationSelectionWithPolls,
            },
          },
        },
      },
    },
  })
}

export const createParticipantAndUser = async (
  { groupId }: GroupParams,
  { userId, name, simulation: simulationDto }: ParticipantCreateDto,
  { session }: { session: Session }
) => {
  const existingParticipant = await session.groupParticipant.findUnique({
    where: {
      groupId_userId: {
        groupId,
        userId,
      },
    },
  })

  // upsert user
  await createOrUpdateUser(
    {
      id: userId,
      user: {
        name,
      },
    },
    { session }
  )

  const {
    simulation,
    simulation: { id: simulationId },
    created: simulationCreated,
    updated: simulationUpdated,
  } = await createParticipantSimulation(
    {
      userId,
      simulation: simulationDto,
    },
    { session }
  )

  const participant = await session.groupParticipant.upsert({
    where: {
      groupId_userId: {
        groupId,
        userId,
      },
    },
    create: {
      groupId,
      userId,
      simulationId,
    },
    update: {
      simulationId,
    },
    select: {
      ...defaultGroupParticipantSelection,
      group: {
        select: defaultGroupSelection,
      },
    },
  })

  return {
    participant: {
      ...participant,
      simulation,
    },
    simulationUpdated,
    simulationCreated,
    created: !existingParticipant,
    updated: !!existingParticipant,
  }
}

export const findGroupAndParticipantById = (
  { groupId, participantId }: GroupParticipantParams,
  { session }: { session: Session }
) => {
  return session.groupParticipant.findUniqueOrThrow({
    where: {
      id: participantId,
      group: {
        id: groupId,
      },
    },
    select: {
      id: true,
      userId: true,
      group: {
        select: {
          administrator: {
            select: {
              userId: true,
            },
          },
        },
      },
    },
  })
}

export const deleteParticipantById = (
  id: string,
  { session }: { session: Session }
) => {
  return session.groupParticipant.delete({
    where: {
      id,
    },
    select: {
      group: {
        select: defaultGroupSelection,
      },
      user: {
        select: defaultUserSelection,
      },
    },
  })
}

export const fetchUserGroups = (
  { userId }: { userId: string },
  { groupIds }: GroupsFetchQuery,
  { session }: { session: Session }
) => {
  return session.group.findMany({
    where: {
      OR: [
        {
          administrator: {
            user: {
              id: userId,
            },
          },
        },
        {
          participants: {
            some: {
              userId,
            },
          },
        },
      ],
      ...(groupIds?.length
        ? {
            id: {
              in: groupIds,
            },
          }
        : {}),
    },
    select: {
      ...defaultGroupSelection,
      participants: {
        select: {
          ...defaultGroupParticipantSelection,
          simulation: {
            select: {
              ...simulationSelectionWithPolls,
            },
          },
        },
      },
    },
  })
}

export const fetchUserGroup = async (
  { groupId }: GroupParams,
  { session }: { session: Session }
) => {
  return await session.group.findUniqueOrThrow({
    where: {
      id: groupId,
    },
    select: {
      ...defaultGroupSelection,
      participants: {
        select: {
          ...defaultGroupParticipantSelection,
          simulation: {
            select: {
              ...simulationSelectionWithPolls,
            },
          },
        },
      },
    },
  })
}

export const deleteUserGroup = (
  {
    userId,
    groupId,
  }: {
    userId: string
    groupId: string
  },
  { session }: { session: Session }
) => {
  return session.group.delete({
    where: {
      id: groupId,
      administrator: {
        userId,
      },
    },
    select: defaultGroupSelection,
  })
}

export const getAdministratorGroupsStats = async (
  administratorId: string,
  { session }: { session: Session }
) => {
  const [createdGroupsCount, createdGroupsWithOneParticipantCount, group] =
    await Promise.all([
      session.group.count({
        where: {
          administrator: {
            userId: administratorId,
          },
        },
      }),
      session.group.count({
        where: {
          administrator: {
            userId: administratorId,
          },
          participants: {
            every: {
              userId: administratorId,
            },
          },
        },
      }),
      session.group.findFirst({
        where: {
          administrator: {
            userId: administratorId,
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          createdAt: true,
        },
      }),
    ])

  return {
    createdGroupsCount,
    createdGroupsWithOneParticipantCount: createdGroupsWithOneParticipantCount,
    lastGroupCreationDate: group?.createdAt,
  }
}

export const getGroupsJoinedCount = (
  userId: string,
  { session }: { session: Session }
) => {
  return session.groupParticipant.count({
    where: {
      userId,
    },
  })
}
