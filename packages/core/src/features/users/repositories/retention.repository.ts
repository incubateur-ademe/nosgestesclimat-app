import type { Transaction } from '../../../lib/transaction.ts'
import { prisma } from '../../../prisma/client.ts'
import {
  finalNoticeActivityBefore,
  retentionNoticeActivityBefore,
} from '../helpers/retention-period.ts'
import type {
  RetentionNoticeCandidate,
  RetentionNoticeStage,
} from '../types/retention.ts'
import {
  mapNoticeStamp,
  mapRetentionNoticeCandidate,
  type RetentionNoticeRow,
} from './retention.mapper.ts'

/**
 * Reads the accounts the retention notice is due to: inactive past its window,
 * but not yet into the final one — an account there is owed the final notice,
 * not this one — and not notified for its current inactivity period.
 *
 * The last condition compares two columns of the row, which Prisma's `where`
 * cannot express (`FieldRef` covers `orderBy` only): the accounts a notice is
 * due to are read in SQL. The language comes with them, one row per account, so
 * that the sweep never carries the simulations of an account along.
 */
export const findAccountsDueForRetentionNotice = async (
  { now }: { now: Date },
  { session = prisma }: { session?: Transaction } = {}
): Promise<RetentionNoticeCandidate[]> => {
  const rows = await session.$queryRaw<RetentionNoticeRow[]>`
    SELECT u.id AS "userId", vu.email, u."lastActivityAt", s.model
    FROM ngc."User" u
    JOIN ngc."VerifiedUser" vu ON vu.id = u.id
    LEFT JOIN LATERAL (
      SELECT model FROM ngc."Simulation"
      WHERE "userId" = u.id
      ORDER BY "createdAt" DESC
      LIMIT 1
    ) s ON true
    WHERE u."lastActivityAt" <= ${retentionNoticeActivityBefore(now)}
      AND u."lastActivityAt" > ${finalNoticeActivityBefore(now)}
      AND (u."retentionNoticeSentAt" IS NULL
        OR u."retentionNoticeSentAt" < u."lastActivityAt")
  `

  return rows.map(mapRetentionNoticeCandidate)
}

/** Reads the accounts the final notice is due to: within a week of erasure,
 * and not notified for their current inactivity period. */
export const findAccountsDueForFinalNotice = async (
  { now }: { now: Date },
  { session = prisma }: { session?: Transaction } = {}
): Promise<RetentionNoticeCandidate[]> => {
  const rows = await session.$queryRaw<RetentionNoticeRow[]>`
    SELECT u.id AS "userId", vu.email, u."lastActivityAt", s.model
    FROM ngc."User" u
    JOIN ngc."VerifiedUser" vu ON vu.id = u.id
    LEFT JOIN LATERAL (
      SELECT model FROM ngc."Simulation"
      WHERE "userId" = u.id
      ORDER BY "createdAt" DESC
      LIMIT 1
    ) s ON true
    WHERE u."lastActivityAt" <= ${finalNoticeActivityBefore(now)}
      AND (u."finalNoticeSentAt" IS NULL
        OR u."finalNoticeSentAt" < u."lastActivityAt")
  `

  return rows.map(mapRetentionNoticeCandidate)
}

/** Stamps the notice the sweep just sent, on the account it warned. */
export const stampRetentionNotice = async (
  {
    userId,
    stage,
    at,
  }: { userId: string; stage: RetentionNoticeStage; at: Date },
  { session = prisma }: { session?: Transaction } = {}
): Promise<void> => {
  await session.user.update({
    where: { id: userId },
    data: mapNoticeStamp({ stage, at }),
    // Prisma always returns a row and nothing here reads it.
    select: { id: true },
  })
}
