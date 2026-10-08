import type { Transaction } from '../../../lib/transaction.ts'
import { prisma } from '../../../prisma/client.ts'
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
    },
    select: userSelect,
  })

  return row ? mapUser(row) : null
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
 * Prisma's `upsert` does not fit: the verified record's primary key is the
 * email, which is exactly what an update can change, and a nested upsert
 * keys on the *new* email - on an email change it would create a second
 * verified record instead of renaming the existing one. The existing
 * verified email must be read first either way, so the branches stay
 * explicit.
 */
export async function createOrUpdateUser(
  user: NewVerifiedUser | VerifiedUser,
  options?: { session?: Transaction }
): Promise<VerifiedUser>
export async function createOrUpdateUser(
  user: NewUser | User,
  options?: { session?: Transaction }
): Promise<User>
export async function createOrUpdateUser(
  user: NewUser | User,
  { session = prisma }: { session?: Transaction } = {}
): Promise<User> {
  const existingUser = await session.user.findUnique({
    where: {
      id: user.id,
    },
    select: {
      verifiedUsers: {
        select: {
          email: true,
        },
      },
    },
  })

  const existingVerifiedEmail = existingUser?.verifiedUsers[0]?.email

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
            verifiedUsers: existingVerifiedEmail
              ? {
                  update: {
                    where: {
                      email: existingVerifiedEmail,
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

  return mapUser(row)
}
