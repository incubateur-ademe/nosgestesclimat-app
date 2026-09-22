import { randomUUID } from 'node:crypto'
import type { Transaction } from '../../../lib/transaction.ts'
import { prisma } from '../../../prisma/client.ts'
import type { UnverifiedUser, User, VerifiedUser } from '../types/user.ts'
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

const verifiedUserSelect = {
  id: true,
  email: true,
  name: true,
  telephone: true,
  position: true,
  optedInForCommunications: true,
  createdAt: true,
  updatedAt: true,
} as const

/**
 * The verified account behind an email, created when absent.
 *
 * `VerifiedUser` is keyed on the email and linked to `User` through a shared
 * id, so both rows are written together, the `User` first: the foreign key
 * points at it. A brand-new pair is given a generated id; an existing one keeps
 * the id it already has, which is what keeps the data attached to it (its
 * simulations, its organisations) stable across calls.
 */
export const upsertVerifiedUser = async (
  { email, id }: { email: string; id?: string },
  tx: Transaction = prisma
): Promise<VerifiedUser> => {
  const existing = await tx.verifiedUser.findUnique({
    where: { email },
    select: { id: true },
  })

  const userId = existing?.id ?? id ?? randomUUID()

  await tx.user.upsert({
    where: { id: userId },
    update: {},
    create: { id: userId },
  })

  const row = await tx.verifiedUser.upsert({
    where: { email },
    update: {},
    create: { id: userId, email },
    select: verifiedUserSelect,
  })

  return {
    type: 'verified',
    id: row.id,
    name: row.name,
    email: row.email,
    telephone: row.telephone,
    position: row.position,
    optedInForCommunications: row.optedInForCommunications,
    ageRange: null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}
