import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { prisma } from '../../../../../prisma/client.ts'
import { organisationFactory } from '../../../../organisations/factories/organisation.factory.ts'
import {
  simulationFactory,
  validComputedResults,
} from '../../../../simulations/factories/simulation.factory.ts'
import { pollFactory } from '../../../factories/poll.factory.ts'
import { PollStatsComputationFailedException } from '../../exceptions/poll-stats-computation.exception.ts'
import { enqueuePollStatsComputation } from '../../repositories/poll-stats-computations.repository.ts'
import { createProcessNextPendingPollStats } from '../process-next-pending-poll-stats.ts'

const mockComputePollStats = vi.fn()

const processNextPendingPollStats = createProcessNextPendingPollStats({
  computePollStats: mockComputePollStats,
})

describe('processNextPendingPollStats', () => {
  beforeEach(() => {
    mockComputePollStats.mockClear()
    mockComputePollStats.mockResolvedValue({
      computedResults: validComputedResults,
      funFacts: {},
    })
  })

  afterEach(async () => {
    await prisma.simulationPoll.deleteMany()
    await prisma.pollStatsComputation.deleteMany()
    await prisma.poll.deleteMany()
    await prisma.simulation.deleteMany()
    await prisma.organisation.deleteMany()
  })

  it('returns false when no job is claimable', async () => {
    const result = await processNextPendingPollStats()

    expect(result).toBe(false)
  })

  it('recomputes and stores stats for an eligible poll', async () => {
    const organisation = await organisationFactory.create()
    const poll = await pollFactory.withOrganisation(organisation.id).create()
    await simulationFactory.completed().withPollId(poll.id).create()

    await enqueuePollStatsComputation(poll.id)

    const result = await processNextPendingPollStats()

    expect(result).toBe(true)

    const computation = await prisma.pollStatsComputation.findUniqueOrThrow({
      where: { pollId: poll.id },
    })
    expect(computation.status).toBe('completed')
    expect(computation.completedAt).not.toBeNull()

    expect(mockComputePollStats).toHaveBeenCalledWith(poll.id)
  })

  it('defers a poll whose cooldown has not elapsed', async () => {
    const organisation = await organisationFactory.create()
    const poll = await pollFactory.withOrganisation(organisation.id).create()

    for (let i = 0; i < 51; i++) {
      await simulationFactory.completed().withPollId(poll.id).create()
    }

    await prisma.pollStatsComputation.create({
      data: { pollId: poll.id, status: 'completed', completedAt: new Date() },
    })
    await enqueuePollStatsComputation(poll.id)

    const result = await processNextPendingPollStats()

    expect(result).toBe(false)
    expect(mockComputePollStats).not.toHaveBeenCalled()

    const computation = await prisma.pollStatsComputation.findUniqueOrThrow({
      where: { pollId: poll.id },
    })
    expect(computation.status).toBe('pending')
    expect(computation.runAt).not.toBeNull()
  })

  it('marks the job failed and throws when the recompute fails', async () => {
    const organisation = await organisationFactory.create()
    const poll = await pollFactory.withOrganisation(organisation.id).create()
    await simulationFactory.completed().withPollId(poll.id).create()

    await enqueuePollStatsComputation(poll.id)

    mockComputePollStats.mockRejectedValue(new Error('boom'))

    await expect(processNextPendingPollStats()).rejects.toThrow(
      PollStatsComputationFailedException
    )

    const computation = await prisma.pollStatsComputation.findUniqueOrThrow({
      where: { pollId: poll.id },
    })
    expect(computation.status).toBe('failed')
    expect(computation.completedAt).not.toBeNull()
  })
})
