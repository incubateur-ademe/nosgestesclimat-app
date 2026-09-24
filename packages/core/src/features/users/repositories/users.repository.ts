import type {
  FetchEntityResponse,
  RequestOptions,
  RequestOptionsOrNull,
  Transaction,
} from '../../../lib/transaction.ts'
import { prisma } from '../../../prisma/client.ts'
import type { Prisma } from '../../../prisma/generated/client.ts'
import type { UnverifiedUser, User } from '../types/user.ts'
import { mapUnverifiedUser, mapUser } from './user.mapper.ts'

const unverifiedUserSelect = {
  id: true,
  name: true,
  ageRange: true,
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

export const findUserById = async (userId: string): Promise<User | null> => {
  const row = await prisma.user.findUnique({
    where: { id: userId },
    select: userSelect,
  })

  return row ? mapUser(row) : null
}

export const fetchUser = <
  Select extends Prisma.UserSelect = { id: true },
  Options extends RequestOptions = RequestOptionsOrNull,
>(
  { id, select = { id: true } as Select }: { id: string; select?: Select },
  { session, orThrow }: Options
): FetchEntityResponse<Prisma.UserGetPayload<{ select: Select }>, Options> => {
  const method = orThrow
    ? session.user.findUniqueOrThrow
    : session.user.findUnique

  return method({
    where: {
      id,
    },
    select,
  }) as FetchEntityResponse<Prisma.UserGetPayload<{ select: Select }>, Options>
}

export const createOrUpdateUser = async <
  Select extends Prisma.UserSelect = { id: true },
>(
  {
    id,
    user: { email, name, ageRange, createdAt, updatedAt },
    select = { id: true } as Select,
  }: {
    id: string
    user: Partial<Prisma.UserModel>
    select?: Select
  },
  { session }: { session: Transaction }
) => {
  const existingUser = await fetchUser({ id }, { session })

  const user = existingUser
    ? await session.user.update({
        where: {
          id,
        },
        data: {
          name,
          email,
          ageRange,
          updatedAt,
          createdAt,
        },
        select,
      })
    : await session.user.create({
        data: {
          id,
          name,
          email,
          ageRange,
          updatedAt,
          createdAt,
        },
        select,
      })

  return {
    user,
    created: !existingUser,
    updated: !!existingUser,
  }
}
