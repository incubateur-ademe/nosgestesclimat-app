import { prisma } from '../../../../prisma/client.ts'

const STALE_PROCESSING_TIMEOUT_SECONDS = 30

const PENDING_ELIGIBILITY = 'AND ("runAt" IS NULL OR "runAt" <= NOW())'

const CLAIM_QUERY = `
  SELECT "pollId"
  FROM "ngc"."PollStatsComputation"
  WHERE (status = 'pending' ${PENDING_ELIGIBILITY})
     OR (
       status = 'processing'
       AND "startedAt" < NOW() - INTERVAL '${STALE_PROCESSING_TIMEOUT_SECONDS} seconds'
     )
  ORDER BY "runAt" ASC NULLS FIRST, "createdAt" ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED
`

/**
 * Marks a poll as needing its stats recomputed.
 *
 * Idempotent and coalescing: a single row per poll. A `completed`/`failed`
 * row is moved back to `pending` (eligible immediately). A `pending` or
 * `processing` row is left untouched, preserving any throttling deferral.
 */
export const enqueuePollStatsComputation = (pollId: string) =>
  prisma.$executeRaw`
    INSERT INTO "ngc"."PollStatsComputation" ("pollId", "status", "updatedAt")
    VALUES (${pollId}, 'pending', NOW())
    ON CONFLICT ("pollId") DO UPDATE SET
      "status" = 'pending',
      "updatedAt" = NOW()
    WHERE "PollStatsComputation"."status" IN ('completed', 'failed')
  `

export const claimNextPendingPollStatsComputation = async () =>
  prisma.$transaction(async (tx) => {
    const jobs =
      await tx.$queryRawUnsafe<Array<{ pollId: string }>>(CLAIM_QUERY)
    if (jobs.length === 0) return null
    const { pollId } = jobs[0]
    const row = await tx.pollStatsComputation.update({
      where: { pollId },
      data: { status: 'processing', startedAt: new Date() },
      select: { pollId: true, completedAt: true },
    })
    return { pollId: row.pollId, completedAt: row.completedAt }
  })

export const releasePollStatsComputation = (pollId: string, runAt: Date) =>
  prisma.pollStatsComputation.update({
    where: { pollId },
    data: { status: 'pending', runAt, startedAt: null },
  })

export const markPollStatsComputationCompleted = (pollId: string) =>
  prisma.pollStatsComputation.update({
    where: { pollId },
    data: { status: 'completed', completedAt: new Date(), runAt: null },
  })

export const markPollStatsComputationFailed = (pollId: string) =>
  prisma.pollStatsComputation.update({
    where: { pollId },
    data: { status: 'failed', completedAt: new Date(), runAt: null },
  })
