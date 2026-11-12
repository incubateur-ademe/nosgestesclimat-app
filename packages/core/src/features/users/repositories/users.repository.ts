import { failure, success, type Result } from '../../../lib/result.ts'
import type { Transaction } from '../../../lib/transaction.ts'
import { prisma } from '../../../prisma/client.ts'
import { UserDeletedError } from '../errors/user-deleted.error.ts'
import type {
  NewUser,
  NewVerifiedUser,
  UnverifiedUser,
  User,
  VerifiedUser,
} from '../types/user.ts'
import { mapUnverifiedUser, mapUser, mapVerifiedUser } from './user.mapper.ts'

const unverifiedUserSelect = {
  id: true,
  name: true,
  createdAt: true,
  updatedAt: true,
} as const

const userSelect = {
  ...unverifiedUserSelect,
  verifiedUsers: {
    select: {
      email: true,
      telephone: true,
      position: true,
      optedInForCommunications: true,
    },
  },
} as const

/**
 * Persists a user. The caller supplies the id, which has no database default.
 * An anonymous account has nothing else to store: the row *is* its id until
 * the user verifies an email.
 */
export const createUser = async (
  { id }: { id: string },
  tx: Transaction = prisma
): Promise<UnverifiedUser> => {
  const row = await tx.user.create({
    data: { id },
    select: unverifiedUserSelect,
  })

  return mapUnverifiedUser(row)
}

export const findUserById = async (
  id: string,
  { session = prisma }: { session?: Transaction } = {}
): Promise<User | null> => {
  const row = await session.user.findUnique({
    where: {
      id,
      deletedAt: null,
    },
    select: userSelect,
  })

  return row ? mapUser(row) : null
}

/** Stamps the account as active */
export const recordUserActivity = async (
  { userId }: { userId: string },
  { session = prisma }: { session?: Transaction } = {}
): Promise<void> => {
  await session.user.update({
    where: { id: userId },
    data: { lastActivityAt: new Date() },
    // `select` is narrowed to the id to reduce data transfer because Prisma
    // always returns a row: nothing here reads it.
    select: { id: true },
  })
}

/**
 * Reads the account's activity date. Null until a session is first issued.
 */
export const findUserLastActivityAt = async (
  { userId }: { userId: string },
  { session = prisma }: { session?: Transaction } = {}
): Promise<Date | null> => {
  const row = await session.user.findUnique({
    where: { id: userId, deletedAt: null },
    select: { lastActivityAt: true },
  })

  return row?.lastActivityAt ?? null
}

/**
 * Only a verified user has an email
 */
export const findVerifiedUserByEmail = async (
  { email }: { email: string },
  { session = prisma }: { session?: Transaction } = {}
): Promise<VerifiedUser | null> => {
  const row = await session.user.findFirst({
    where: {
      deletedAt: null,
      verifiedUsers: {
        some: {
          email,
        },
      },
    },
    select: userSelect,
  })

  // The where clause guarantees a verified record exists on the found user.
  return row ? mapVerifiedUser(row) : null
}

/**
 * Persists the user aggregate: the user is created or updated together with
 * its verified record on a verified write. The VerifiedUser.id -> User.id FK
 * requires the User row to exist first, so the verified record is written
 * nested, in the same statement as the user.
 *
 * An existing `User` is valid input as-is: the write only carries the fields
 * the user aggregate owns, the timestamps being the database's - `createdAt`
 * is never written on an update.
 *
 * The write branches on whether a verified record already exists: an update
 * carries only the fields the write owns, a create carries all of them. Both
 * reach the record through the user's id, which is the record's primary key,
 * so an email change renames the existing record instead of creating a second
 * one.
 */
export async function createOrUpdateUser(
  user: NewVerifiedUser | VerifiedUser,
  options?: { session?: Transaction }
): Promise<Result<VerifiedUser, UserDeletedError>>
export async function createOrUpdateUser(
  user: NewUser | User,
  options?: { session?: Transaction }
): Promise<Result<User, UserDeletedError>>
export async function createOrUpdateUser(
  user: NewUser | User,
  { session = prisma }: { session?: Transaction } = {}
): Promise<Result<User, UserDeletedError>> {
  const existingUser = await session.user.findUnique({
    where: {
      id: user.id,
    },
    select: {
      deletedAt: true,
      verifiedUsers: {
        select: {
          id: true,
        },
      },
    },
  })

  if (existingUser?.deletedAt) {
    return failure(
      new UserDeletedError({
        message: `Cannot update soft-deleted user`,
        userId: user.id,
      })
    )
  }

  const hasVerifiedRecord = !!existingUser?.verifiedUsers.length

  // The verified record is the source of truth for the email; the user
  // table's email column mirrors it for the readers that have not migrated
  // to the verified record yet.
  const userData = {
    name: user.name,
    ...(user.type === 'verified' ? { email: user.email } : {}),
  }

  // A verified write persists the verified record together with the user.
  // Prisma skips undefined fields, so only the fields the write carries are
  // updated; the email is the record's final email, changed or unchanged.
  const verifiedUserData =
    user.type === 'verified'
      ? {
          email: user.email,
          name: user.name,
          position: user.position,
          telephone: user.telephone,
          optedInForCommunications: user.optedInForCommunications,
        }
      : undefined

  const row = existingUser
    ? await session.user.update({
        where: {
          id: user.id,
        },
        data: {
          ...userData,
          ...(verifiedUserData && {
            verifiedUsers: hasVerifiedRecord
              ? {
                  update: {
                    where: {
                      id: user.id,
                    },
                    data: verifiedUserData,
                  },
                }
              : {
                  create: verifiedUserData,
                },
          }),
        },
        select: userSelect,
      })
    : await session.user.create({
        data: {
          id: user.id,
          ...userData,
          ...(verifiedUserData && {
            verifiedUsers: {
              create: verifiedUserData,
            },
          }),
        },
        select: userSelect,
      })

  return success(mapUser(row))
}

export const deleteUser = async (
  userId: string,
  { session = prisma }: { session?: Transaction } = {}
) => {
  await session.verifiedUser.deleteMany({
    where: {
      id: userId,
    },
  })
  await session.user.updateMany({
    where: {
      id: userId,
    },
    data: {
      deletedAt: new Date(),
      email: null,
      name: null,
    },
  })
}
