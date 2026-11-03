import type { Transaction } from '../../../lib/transaction.ts'
import { prisma } from '../../../prisma/client.ts'
import {
  erasureActivityDateCutoff,
  finalNoticeActivityDateCutoff,
  retentionNoticeActivityDateCutoff,
} from '../helpers/retention-period.ts'
import type {
  ErasureCandidate,
  RetentionNoticeCandidate,
  RetentionNoticeStamp,
} from '../types/retention.ts'
import {
  mapErasureCandidate,
  mapRetentionNoticeCandidate,
  type RetentionNoticeRow,
} from './retention.mapper.ts'

/**
 * Reads the accounts the retention notice is due to. The due condition compares
 * two columns, which Prisma's `where` cannot express: hence the SQL.
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
    WHERE u."lastActivityAt" <= ${retentionNoticeActivityDateCutoff(now)}
      AND u."lastActivityAt" > ${finalNoticeActivityDateCutoff(now)}
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
    WHERE u."lastActivityAt" <= ${finalNoticeActivityDateCutoff(now)}
      AND (u."finalNoticeSentAt" IS NULL
        OR u."finalNoticeSentAt" < u."lastActivityAt")
    ORDER BY u.id, s."updatedAt" DESC
  `

  return rows.map(mapRetentionNoticeCandidate)
}

/** Reads the accounts past the retention period that still hold a verified record. */
export const findAccountsDueForErasure = async (
  { now }: { now: Date },
  { session = prisma }: { session?: Transaction } = {}
): Promise<ErasureCandidate[]> => {
  const rows = await session.user.findMany({
    where: {
      lastActivityAt: { lte: erasureActivityDateCutoff(now) },
      deletedAt: null,
      verifiedUsers: { some: {} },
    },
    select: { id: true },
  })

  return rows.map(mapErasureCandidate)
}

/** Writes the notice stamps of an account. */
export const updateRetentionNotice = async (
  { userId, data }: { userId: string; data: RetentionNoticeStamp },
  { session = prisma }: { session?: Transaction } = {}
): Promise<void> => {
  await session.user.update({
    where: { id: userId },
    data,
    // Narrowed to the id: nothing reads the returned row.
    select: { id: true },
  })
}
