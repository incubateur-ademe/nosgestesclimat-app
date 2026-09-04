import { afterEach, describe, expect, it, test } from 'vitest'
import { prisma } from '../../../../../prisma/client.ts'
import { pollStatsComputationFactory } from '../../../factories/poll-stats-computation.factory.ts'
import { getPollStatsComputationStatus } from '../../repositories/poll-stats-computations.repository.ts'
import { createEnqueuePollStatsComputation } from '../enqueue-poll-stats-computation.ts'

const immediateEnqueue = createEnqueuePollStatsComputation({
  cooldownTiers: [{ upTo: null, cooldownSeconds: 0 }],
})

const deferredEnqueue = createEnqueuePollStatsComputation({
  cooldownTiers: [{ upTo: null, cooldownSeconds: 3600 }],
})

describe('enqueuePollStatsComputation', () => {
  afterEach(async () => {
    await prisma.pollStatsComputation.deleteMany()
    await prisma.poll.deleteMany()
    await prisma.organisation.deleteMany()
  })

  it('creates an immediate pending computation when no row exists', async () => {
    const poll = await pollStatsComputationFactory.create()

    const before = Date.now()
    await immediateEnqueue(poll.id)
    const after = Date.now()

    const computation = await getPollStatsComputationStatus(poll.id)
    expect(computation!.status).toBe('pending')
    expect(computation!.scheduledAt?.getTime()).toBeGreaterThanOrEqual(before)
    expect(computation!.scheduledAt?.getTime()).toBeLessThanOrEqual(after)
  })

  it('re-arms a completed computation immediately when the cooldown is 0s', async () => {
    const poll = await pollStatsComputationFactory
      .withCompletedComputation()
      .create()

    const before = Date.now()
    await immediateEnqueue(poll.id)
    const after = Date.now()

    const computation = await getPollStatsComputationStatus(poll.id)
    expect(computation!.status).toBe('pending')
    expect(computation!.scheduledAt?.getTime()).toBeGreaterThanOrEqual(before)
    expect(computation!.scheduledAt?.getTime()).toBeLessThanOrEqual(after)
  })

  it('defers a completed computation when the cooldown is large', async () => {
    const poll = await pollStatsComputationFactory
      .withCompletedComputation()
      .create()

    await deferredEnqueue(poll.id)

    const computation = await getPollStatsComputationStatus(poll.id)
    expect(computation!.status).toBe('pending')
    expect(computation!.scheduledAt?.getTime()).toBeGreaterThan(
      Date.now() + 30 * 60 * 1000
    )
  })

  it('reschedules a failed computation to pending now', async () => {
    const poll = await pollStatsComputationFactory
      .withFailedComputation()
      .create()

    const before = Date.now()
    await immediateEnqueue(poll.id)
    const after = Date.now()

    const computation = await getPollStatsComputationStatus(poll.id)
    expect(computation!.status).toBe('pending')
    expect(computation!.scheduledAt?.getTime()).toBeGreaterThanOrEqual(before)
    expect(computation!.scheduledAt?.getTime()).toBeLessThanOrEqual(after)
  })

  it('keeps the scheduledAt when a deferred computation is enqueued again', async () => {
    const poll = await pollStatsComputationFactory
      .withCompletedComputation()
      .create()

    await deferredEnqueue(poll.id)
    const firstScheduledAt = (await getPollStatsComputationStatus(poll.id))!
      .scheduledAt

    await deferredEnqueue(poll.id)

    const computation = await getPollStatsComputationStatus(poll.id)
    expect(computation!.status).toBe('pending')
    expect(computation!.scheduledAt?.getTime()).toBe(
      firstScheduledAt!.getTime()
    )
  })

  test.each([
    {
      name: 'leaves a deferred pending computation untouched',
      create: () =>
        pollStatsComputationFactory
          .withPendingComputation(new Date(Date.now() + 60 * 1000))
          .create(),
    },
    {
      name: 'leaves a processing computation untouched',
      create: () =>
        pollStatsComputationFactory.withProcessingComputation().create(),
    },
  ])('$name', async ({ create }) => {
    const poll = await create()
    const before = await getPollStatsComputationStatus(poll.id)

    await immediateEnqueue(poll.id)

    const after = await getPollStatsComputationStatus(poll.id)
    expect(after).toEqual(before)
  })
})
