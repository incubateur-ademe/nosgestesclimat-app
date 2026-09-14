import type { AgeRange } from '../types/age-range.ts'
import type { UnverifiedUser, User, VerifiedUser } from '../types/user.ts'

export type UserBaseRow = {
  id: string
  name: string | null
  ageRange: AgeRange | null
  createdAt: Date
  updatedAt: Date
}

export type VerifiedUserRelation = {
  email: string
  telephone: string | null
  position: string | null
  optedInForCommunications: boolean
}

export type UserRow = UserBaseRow & {
  /** TODO: User should have only 1 VerifiedUser */
  verifiedUsers: VerifiedUserRelation[]
}

/**
 * Maps a Prisma row to an `UnverifiedUser`. The user's own email column is
 * deprecated and always null for an anonymous account.
 */
export const mapUnverifiedUser = (row: UserBaseRow): UnverifiedUser => ({
  type: 'unverified',
  id: row.id,
  name: row.name,
  email: null, // user's table email field is deprecated
  ageRange: row.ageRange,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
})

/**
 * Maps a Prisma row to a `VerifiedUser`. The email is read from the verified
 * record, not the deprecated user column.
 */
export const mapVerifiedUser = (row: UserRow): VerifiedUser => {
  const verifiedUser = row.verifiedUsers[0]

  return {
    type: 'verified',
    id: row.id,
    name: row.name,
    email: verifiedUser.email,
    ageRange: row.ageRange,
    telephone: verifiedUser.telephone,
    position: verifiedUser.position,
    optedInForCommunications: verifiedUser.optedInForCommunications,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

export const mapUser = (row: UserRow): User =>
  row.verifiedUsers[0] ? mapVerifiedUser(row) : mapUnverifiedUser(row)
