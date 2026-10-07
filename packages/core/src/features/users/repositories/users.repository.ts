import type { Transaction } from '../../../lib/transaction.ts'
import { prisma } from '../../../prisma/client.ts'
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
