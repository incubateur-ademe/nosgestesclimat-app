import { prisma } from '@nosgestesclimat/core/prisma/client'
import logger, { errorMeta } from '../../src/logger.ts'

/**
 * Seeds the state the NGC-4121 deduplication repairs, for a review app: 218
 * "VerifiedUser" rows spread over 22 groups, each group sharing one
 * "VerifiedUser"."id" — and therefore one "User" row — with at most 10 rows per
 * group (21 groups of 10 rows and one group of 8).
 *
 * Within a group, the first row carries the most recent "updatedAt", so the
 * deduplication plan ranks it first and keeps it under the shared id.
 *
 * The ids, emails and dates are fixed: a second run inserts nothing, and a run
 * that follows the deduplication script restores the rows it deleted.
 */

const SEEDED_VERIFIED_USER_ROWS = 218
const MAX_ROWS_PER_SHARED_USER = 10
const EMAIL_LOCAL_PART_PREFIX = 'duplicated-verified-user'
const EMAIL_DOMAIN = 'example.fr'
const SHARED_USER_ID_PREFIX = 'aaaaaaaa-0000-4000-8000-'
const SEEDED_DATE = new Date('2026-01-01T00:00:00.000Z')
const ONE_HOUR_IN_MS = 60 * 60 * 1000

interface SeededUser {
  id: string
  email: string
  name: string
}

interface SeededVerifiedUser extends SeededUser {
  updatedAt: Date
}

export interface VerifiedUserSeedClient {
  $executeRawUnsafe(query: string): Promise<unknown>
  $queryRawUnsafe<T = unknown>(query: string): Promise<T>
}

export interface SeededDuplicatedVerifiedUsers {
  /** The number of "VerifiedUser"."id" values the seeded rows share. */
  sharedUsers: number
  /** The number of seeded "VerifiedUser" rows. */
  verifiedUsers: number
  /** The number of rows of the largest seeded group. */
  rowsInLargestGroup: number
}

/** Splits the row count into groups of at most "maxRowsPerGroup" rows. */
const splitIntoGroups = (rows: number, maxRowsPerGroup: number): number[] => {
  const groups: number[] = []

  for (let remaining = rows; remaining > 0; remaining -= maxRowsPerGroup) {
    groups.push(Math.min(maxRowsPerGroup, remaining))
  }

  return groups
}

const twoDigits = (value: number) => String(value).padStart(2, '0')

const sharedUserIdOf = (group: number) =>
  `${SHARED_USER_ID_PREFIX}${String(group).padStart(12, '0')}`

/** Padded, so the alphabetical order of the emails is the order of the rows. */
const emailOf = (group: number, row: number) =>
  `${EMAIL_LOCAL_PART_PREFIX}-${twoDigits(group)}-${twoDigits(row)}@${EMAIL_DOMAIN}`

/**
 * One "User" row per group. Its "email" mirrors the "VerifiedUser" row the
 * deduplication keeps under the shared id, as a verified write does.
 */
const buildSharedUsers = (groups: number[]): SeededUser[] =>
  groups.map((_rowsInGroup, index) => {
    const group = index + 1

    return {
      id: sharedUserIdOf(group),
      email: emailOf(group, 1),
      name: `Shared account ${twoDigits(group)}`,
    }
  })

const buildVerifiedUsers = (groups: number[]): SeededVerifiedUser[] =>
  groups.flatMap((rowsInGroup, index) => {
    const group = index + 1

    return Array.from({ length: rowsInGroup }, (_unused, rowIndex) => {
      const row = rowIndex + 1

      return {
        email: emailOf(group, row),
        id: sharedUserIdOf(group),
        name: `Shared account ${twoDigits(group)} row ${twoDigits(row)}`,
        updatedAt: new Date(
          SEEDED_DATE.getTime() + (rowsInGroup - row) * ONE_HOUR_IN_MS
        ),
      }
    })
  })

const INSERT_SHARED_USERS_SQL = (users: SeededUser[]) => /* sql */ `
  INSERT INTO "ngc"."User" ("id", "email", "name", "createdAt", "updatedAt")
  VALUES
${users
  .map(
    ({ id, email, name }) =>
      `    ('${id}', '${email}', '${name}', '${SEEDED_DATE.toISOString()}', '${SEEDED_DATE.toISOString()}')`
  )
  .join(',\n')}
  ON CONFLICT ("id") DO NOTHING`

const INSERT_VERIFIED_USERS_SQL = (rows: SeededVerifiedUser[]) => /* sql */ `
  INSERT INTO "ngc"."VerifiedUser" ("email", "id", "name", "createdAt", "updatedAt")
  VALUES
${rows
  .map(
    ({ email, id, name, updatedAt }) =>
      `    ('${email}', '${id}', '${name}', '${SEEDED_DATE.toISOString()}', '${updatedAt.toISOString()}')`
  )
  .join(',\n')}
  ON CONFLICT ("email") DO NOTHING`

/** Reads the seeded groups back: the situation is in place when they are. */
const SEEDED_GROUPS_SUMMARY_SQL = /* sql */ `
  SELECT
    COUNT(*)::int AS "sharedUsers",
    COALESCE(SUM("rowsPerSharedUser"), 0)::int AS "verifiedUsers",
    COALESCE(MAX("rowsPerSharedUser"), 0)::int AS "rowsInLargestGroup"
  FROM (
    SELECT "id", COUNT(*)::int AS "rowsPerSharedUser"
    FROM "ngc"."VerifiedUser"
    WHERE "email" LIKE '${EMAIL_LOCAL_PART_PREFIX}-%@${EMAIL_DOMAIN}'
    GROUP BY "id"
  ) seeded_group`

/**
 * Writes the groups and reads them back. The "VerifiedUser"."id" foreign key
 * requires the "User" rows first; both inserts accept the rows a previous run
 * already wrote.
 */
export const seedDuplicatedVerifiedUsers = async ({
  client = prisma,
}: {
  client?: VerifiedUserSeedClient
} = {}): Promise<SeededDuplicatedVerifiedUsers> => {
  const groups = splitIntoGroups(
    SEEDED_VERIFIED_USER_ROWS,
    MAX_ROWS_PER_SHARED_USER
  )

  await client.$executeRawUnsafe(
    INSERT_SHARED_USERS_SQL(buildSharedUsers(groups))
  )
  await client.$executeRawUnsafe(
    INSERT_VERIFIED_USERS_SQL(buildVerifiedUsers(groups))
  )

  const [summary] = await client.$queryRawUnsafe<
    SeededDuplicatedVerifiedUsers[]
  >(SEEDED_GROUPS_SUMMARY_SQL)

  return {
    sharedUsers: summary?.sharedUsers ?? 0,
    verifiedUsers: summary?.verifiedUsers ?? 0,
    rowsInLargestGroup: summary?.rowsInLargestGroup ?? 0,
  }
}

const run = async () => {
  try {
    const seeded = await seedDuplicatedVerifiedUsers()

    logger.info('Duplicated VerifiedUsers seeded', {
      expectedVerifiedUsers: SEEDED_VERIFIED_USER_ROWS,
      expectedRowsInLargestGroup: MAX_ROWS_PER_SHARED_USER,
      ...seeded,
    })
  } catch (error) {
    logger.error('Duplicated VerifiedUsers seed failed', errorMeta(error))
    process.exitCode = 1
  } finally {
    await prisma.$disconnect()
  }
}

const isMain =
  process.argv[1] && import.meta.url === `file://${process.argv[1]}`

if (isMain) {
  void run()
}
