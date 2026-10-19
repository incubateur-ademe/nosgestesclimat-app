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
 * Reads the accounts the retention notice is due to. The due condition compares
 * two columns, which Prisma's `where` cannot express: hence the SQL, which also
 * reads the account's language without carrying its simulations along.
 */
export const findAccountsDueForRetentionNotice = async (
  { now }: { now: Date },
  { session = prisma }: { session?: Transaction } = {}
): Promise<RetentionNoticeCandidate[]> => {
  const rows = await session.$queryRaw<RetentionNoticeRow[]>`
    SELECT DISTINCT ON (u.id)
      u.id AS "userId", vu.email, u."lastActivityAt", s.model
    FROM ngc."User" u
    JOIN ngc."VerifiedUser" vu ON vu.id = u.id
    LEFT JOIN ngc."Simulation" s ON s."userId" = u.id
    WHERE u."lastActivityAt" <= ${retentionNoticeActivityBefore(now)}
      AND u."lastActivityAt" > ${finalNoticeActivityBefore(now)}
      AND (u."retentionNoticeSentAt" IS NULL
        OR u."retentionNoticeSentAt" < u."lastActivityAt")
    ORDER BY u.id, s."updatedAt" DESC
  `

  return rows.map(mapRetentionNoticeCandidate)
}

/** Reads the accounts the final notice is due to. */
export const findAccountsDueForFinalNotice = async (
  { now }: { now: Date },
  { session = prisma }: { session?: Transaction } = {}
): Promise<RetentionNoticeCandidate[]> => {
  const rows = await session.$queryRaw<RetentionNoticeRow[]>`
    SELECT DISTINCT ON (u.id)
      u.id AS "userId", vu.email, u."lastActivityAt", s.model
    FROM ngc."User" u
    JOIN ngc."VerifiedUser" vu ON vu.id = u.id
    LEFT JOIN ngc."Simulation" s ON s."userId" = u.id
    WHERE u."lastActivityAt" <= ${finalNoticeActivityBefore(now)}
      AND (u."finalNoticeSentAt" IS NULL
        OR u."finalNoticeSentAt" < u."lastActivityAt")
    ORDER BY u.id, s."updatedAt" DESC
  `

  return rows.map(mapRetentionNoticeCandidate)
}

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
