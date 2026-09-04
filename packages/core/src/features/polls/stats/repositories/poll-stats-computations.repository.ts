import { prisma } from '../../../../prisma/client.ts'

// Must exceed the maximum duration of a poll stats recomputation so a worker
// crash mid-recompute does not leave the row stuck in `processing`.
const STALE_PROCESSING_TIMEOUT_SECONDS = 600

// Invariant: a `pending` row always carries a non-null `scheduledAt` (the next
// execution due date; "immediate" is `new Date()`). Only `completed`, `failed`
// and `processing` rows may have a null `scheduledAt`. Claimable rows are thus
// `pending` rows whose due date passed, plus stale `processing` rows.
const CLAIM_QUERY = `
  SELECT "pollId"
  FROM "ngc"."PollStatsComputation"
  WHERE (status = 'pending' AND "scheduledAt" <= NOW())
     OR (status = 'processing' AND "startedAt" < NOW() - INTERVAL '${STALE_PROCESSING_TIMEOUT_SECONDS} seconds')
  ORDER BY "scheduledAt" ASC, "createdAt" ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED
`

export const claimNextPendingPollStatsComputation = async () =>
  prisma.$transaction(async (tx) => {
    const jobs =
      await tx.$queryRawUnsafe<Array<{ pollId: string }>>(CLAIM_QUERY)
    if (jobs.length === 0) return null
    const { pollId } = jobs[0]
    await tx.pollStatsComputation.update({
      where: { pollId },
      data: { status: 'processing', startedAt: new Date() },
    })
    return { pollId }
  })

export const markPollStatsComputationCompleted = (pollId: string) =>
  prisma.pollStatsComputation.update({
    where: { pollId },
    data: { status: 'completed', scheduledAt: null, startedAt: null },
  })

export const markPollStatsComputationFailed = (pollId: string) =>
  prisma.pollStatsComputation.update({
    where: { pollId },
    data: { status: 'failed', scheduledAt: null, startedAt: null },
  })

export const getPollStatsComputationStatus = (pollId: string) =>
  prisma.pollStatsComputation.findUnique({
    where: { pollId },
    select: { status: true, scheduledAt: true, startedAt: true },
  })

export const schedulePollStatsComputation = (
  pollId: string,
  scheduledAt: Date
) =>
  prisma.pollStatsComputation.upsert({
    where: { pollId },
    create: { pollId, status: 'pending', scheduledAt },
    update: { status: 'pending', scheduledAt },
  })
