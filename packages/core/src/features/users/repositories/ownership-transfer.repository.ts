import type { Transaction } from '../../../lib/transaction.ts'

/**
 * Upserts the target user row with a legacy user's profile. The ownership
 * transfer only needs the writes: the returned row is never read.
 */
const createOrUpdateUser = async (
  {
    id,
    user: { email, name, createdAt, updatedAt },
  }: {
    id: string
    user: {
      email: string | null
      name: string | null
      createdAt: Date
      updatedAt: Date
    }
  },
  { session }: { session: Transaction }
) => {
  const existingUser = await session.user.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
    },
  })

  const data = {
    name,
    email,
    updatedAt,
    createdAt,
  }

  await (existingUser
    ? session.user.update({
        where: {
          id,
        },
        data,
        select: { id: true },
      })
    : session.user.create({
        data: {
          id,
          ...data,
        },
        select: { id: true },
      }))
}

/**
 * Legacy migration function. Finds all anonymous users sharing the same
 * email and merges their data (simulations, group participations, polls)
 * into the target verified user.
 *
 * This exists to fix a previous behaviour where unverified users could
 * have an email set. Now only verified users have emails, so this
 * function will eventually be removed once all legacy data is migrated.
 */
export const transferOwnershipToUser = async (
  {
    user: { id: userId, email },
    verified,
  }: { user: { id: string; email: string }; verified?: boolean },
  { session }: { session: Transaction }
) => {
  const usersToMigrate = await session.user.findMany({
    where: {
      id: {
        not: userId,
      },
      email,
    },
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  const [existingUser] = usersToMigrate

  if (!existingUser) {
    return
  }

  await createOrUpdateUser(
    {
      id: userId,
      user: existingUser,
    },
    { session }
  )

  const userIds = usersToMigrate.map(({ id }) => id)
  const [newUserGroupIds, oldUsersGroups] = await Promise.all([
    session.groupParticipant
      .findMany({
        where: {
          userId,
        },
        select: {
          groupId: true,
        },
      })
      .then(
        (groupParticipants) =>
          new Set(groupParticipants.map(({ groupId }) => groupId))
      ),
    session.groupParticipant.findMany({
      where: {
        userId: {
          in: userIds,
        },
      },
      select: {
        groupId: true,
        userId: true,
      },
    }),
  ])

  const participantsToUpdate = new Set<string>()
  const participantsToDelete = new Set<string>()
  oldUsersGroups.forEach(({ groupId, userId }) => {
    if (newUserGroupIds.has(groupId)) {
      participantsToDelete.add(userId)
    } else {
      newUserGroupIds.add(groupId)
      participantsToUpdate.add(userId)
    }
  })

  await Promise.all([
    session.groupAdministrator.updateMany({
      where: {
        userId: {
          in: userIds,
        },
      },
      data: {
        userId,
      },
    }),
    session.simulation.updateMany({
      where: {
        userId: {
          in: userIds,
        },
      },
      data: {
        userId,
        ...(verified
          ? {
              userEmail: email,
            }
          : {}),
      },
    }),
    session.groupParticipant.updateMany({
      where: {
        userId: {
          in: Array.from(participantsToUpdate),
        },
      },
      data: {
        userId,
      },
    }),
    session.groupParticipant.deleteMany({
      where: {
        userId: {
          in: Array.from(participantsToDelete),
        },
      },
    }),
    ...(verified
      ? [
          session.verifiedUser.updateMany({
            where: {
              email,
              name: null,
            },
            data: {
              name: existingUser.name,
            },
            limit: 1,
          }),
        ]
      : []),
  ])

  const oldPollsSimulations = await session.simulationPoll.findMany({
    skip: 1,
    where: {
      simulation: {
        userId,
      },
    },
    orderBy: {
      simulation: {
        createdAt: 'desc',
      },
    },
    select: {
      id: true,
    },
  })

  await Promise.all([
    session.user.deleteMany({
      where: {
        id: {
          not: userId,
        },
        email,
      },
    }),
    session.simulationPoll.deleteMany({
      where: {
        id: {
          in: oldPollsSimulations.map(({ id }) => id),
        },
      },
    }),
  ])
}

/**
 * Transfers simulations (and group participations) from a specific anonymous
 * user to a verified user, identified directly by their previous userId.
 *
 * Unlike `transferOwnershipToUser`, this function does not rely on email
 * matching — it uses the explicit previousUserId, which makes it safe for
 * the signIn login path where the anonymous user may not have an email set.
 */
export const transferSimulationsFromUser = async (
  {
    user: { id: userId, email },
    previousUserId,
  }: {
    user: { id: string; email: string }
    previousUserId: string
  },
  { session }: { session: Transaction }
) => {
  if (previousUserId === userId) {
    return
  }

  const previousUser = await session.user.findUnique({
    where: { id: previousUserId },
    select: { id: true },
  })

  if (!previousUser) {
    return
  }

  const [targetGroupIds] = await Promise.all([
    session.groupParticipant
      .findMany({
        where: { userId },
        select: { groupId: true },
      })
      .then(
        (participants) => new Set(participants.map(({ groupId }) => groupId))
      ),
    session.simulation.updateMany({
      where: { userId: previousUserId },
      data: {
        userId,
        userEmail: email,
      },
    }),
  ])

  await session.groupParticipant.deleteMany({
    where: {
      userId: previousUserId,
      groupId: { in: Array.from(targetGroupIds) },
    },
  })

  await session.groupParticipant.updateMany({
    where: { userId: previousUserId },
    data: { userId },
  })

  await session.user.deleteMany({
    where: { id: previousUserId },
  })
}
