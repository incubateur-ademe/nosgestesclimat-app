import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { success } from '../../../../../lib/result.ts'
import { prisma } from '../../../../../prisma/client.ts'
import { createComputedResults } from '../../../../simulations/factories/simulation.factory.ts'
import { pollStatsComputationFactory } from '../../../factories/poll-stats-computation.factory.ts'
import { PollStatsComputationFailedError } from '../../exceptions/poll-stats-computation.exception.ts'
import { getPollStatsComputationStatus } from '../../repositories/poll-stats-computations.repository.ts'
import { createProcessNextPendingPollStats } from '../process-next-pending-poll-stats.ts'

const mockComputePollStats = vi.fn()

const processNextPendingPollStats = createProcessNextPendingPollStats({
  computePollStats: mockComputePollStats,
})

describe('processNextPendingPollStats', () => {
  beforeEach(() => {
    mockComputePollStats.mockClear()
    mockComputePollStats.mockResolvedValue({
      computedResults: createComputedResults(),
      funFacts: {},
    })
  })

  afterEach(async () => {
    await prisma.pollStatsComputation.deleteMany()
    await prisma.poll.deleteMany()
    await prisma.organisation.deleteMany()
  })

  it('returns success(false) when no job is claimable', async () => {
    const result = await processNextPendingPollStats()

    expect(result).toEqual(success(false))
  })

  it('processes an eligible pending job end-to-end', async () => {
    const poll = await pollStatsComputationFactory
      .withPendingComputation(new Date(Date.now() - 1000))
      .create()

    const result = await processNextPendingPollStats()

    expect(result).toEqual(success(true))

    const computation = await getPollStatsComputationStatus(poll.id)
    expect(computation!.status).toBe('completed')
    expect(computation!.scheduledAt).toBeNull()
    expect(computation!.startedAt).toBeNull()

    expect(mockComputePollStats).toHaveBeenCalledWith(poll.id)
  })

  it('leaves a deferred pending job untouched', async () => {
    const scheduledAt = new Date(Date.now() + 60 * 1000)
    const poll = await pollStatsComputationFactory
      .withPendingComputation(scheduledAt)
      .create()

    const result = await processNextPendingPollStats()

    expect(result).toEqual(success(false))
    expect(mockComputePollStats).not.toHaveBeenCalled()

    const computation = await getPollStatsComputationStatus(poll.id)
    expect(computation!.status).toBe('pending')
    expect(computation!.scheduledAt?.getTime()).toBe(scheduledAt.getTime())
  })

  it('reclaims a stale processing job', async () => {
    const poll = await pollStatsComputationFactory
      .withStaleProcessingComputation()
      .create()

    const result = await processNextPendingPollStats()

    expect(result).toEqual(success(true))

    const computation = await getPollStatsComputationStatus(poll.id)
    expect(computation!.status).toBe('completed')
    expect(computation!.scheduledAt).toBeNull()
    expect(computation!.startedAt).toBeNull()
  })

  it('does not recompute a poll whose computation is currently being processed', async () => {
    const poll = await pollStatsComputationFactory
      .withProcessingComputation()
      .create()

    const result = await processNextPendingPollStats()

    expect(result).toEqual(success(false))
    expect(mockComputePollStats).not.toHaveBeenCalled()

    const computation = await getPollStatsComputationStatus(poll.id)
    expect(computation!.status).toBe('processing')
    expect(computation!.startedAt).not.toBeNull()
  })

  it('marks the computation as failed and returns a failure when the recompute fails', async () => {
    const poll = await pollStatsComputationFactory
      .withPendingComputation(new Date(Date.now() - 1000))
      .create()

    mockComputePollStats.mockRejectedValue(new Error('boom'))

    const result = await processNextPendingPollStats()

    expect(result.success).toBe(false)
    if (result.success) {
      throw new Error('Expected processNextPendingPollStats to fail')
    }
    expect(result.error).toBeInstanceOf(PollStatsComputationFailedError)
    expect(result.error.pollId).toBe(poll.id)

    const computation = await getPollStatsComputationStatus(poll.id)
    expect(computation!.status).toBe('failed')
    expect(computation!.scheduledAt).toBeNull()
    expect(computation!.startedAt).toBeNull()
  })
})
