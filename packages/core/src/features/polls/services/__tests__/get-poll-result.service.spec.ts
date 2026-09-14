import { afterEach, describe, expect, it } from 'vitest'
import { prisma } from '../../../../prisma/client.ts'
import { organisationFactory } from '../../../organisations/factories/organisation.factory.ts'
import { pollFactory } from '../../../polls/factories/poll.factory.ts'
import { computedResultsFactory } from '../../../simulations/factories/computed-results.factory.ts'
import { simulationFactory } from '../../../simulations/factories/simulation.factory.ts'
import { userFactory } from '../../../users/factories/user.factory.ts'
import { getPollResult } from '../get-poll-result.service.ts'

describe('getPollResult', () => {
  afterEach(async () => {
    await prisma.simulationPoll.deleteMany()
    await prisma.poll.deleteMany()
    await prisma.organisation.deleteMany()
    await prisma.simulation.deleteMany()
    await prisma.user.deleteMany()
  })

  it('returns null when no poll matches', async () => {
    const organisation = await organisationFactory.create()

    const result = await getPollResult({
      organisationSlug: organisation.slug,
      pollIdOrSlug: 'does-not-exist',
      userId: null,
    })

    expect(result).toBeNull()
  })

  it('returns null when the poll belongs to another organisation', async () => {
    const organisation = await organisationFactory.create()
    const poll = await createPollIn(organisation.id)
    const otherOrganisation = await organisationFactory.create()

    const result = await getPollResult({
      organisationSlug: otherOrganisation.slug,
      pollIdOrSlug: poll.slug,
      userId: null,
    })

    expect(result).toBeNull()
  })

  it('exposes the poll and counts its finished simulations', async () => {
    const organisation = await organisationFactory.create()
    const poll = await createPollIn(organisation.id)

    await simulationFactory.completed().withPollId(poll.id).create()
    await simulationFactory.completed().withPollId(poll.id).create()
    await simulationFactory.started().withPollId(poll.id).create()

    const result = await getPollResult({
      organisationSlug: organisation.slug,
      pollIdOrSlug: poll.slug,
      userId: null,
    })

    expect(result?.poll.id).toBe(poll.id)
    expect(result?.participants).toBe(2)
  })

  it('resolves the poll by id', async () => {
    const organisation = await organisationFactory.create()
    const poll = await createPollIn(organisation.id)

    const result = await getPollResult({
      organisationSlug: organisation.slug,
      pollIdOrSlug: poll.id,
      userId: null,
    })

    expect(result?.poll.id).toBe(poll.id)
  })

  it('has no user participation when there is no userId', async () => {
    const organisation = await organisationFactory.create()
    const poll = await createPollIn(organisation.id)

    const result = await getPollResult({
      organisationSlug: organisation.slug,
      pollIdOrSlug: poll.slug,
      userId: null,
    })

    expect(result?.userParticipation).toBeNull()
  })

  it('exposes the user participation once finished', async () => {
    const organisation = await organisationFactory.create()
    const poll = await createPollIn(organisation.id)
    const user = await userFactory.create()
    const simulation = await simulationFactory
      .completed()
      .withPollId(poll.id)
      .params({ userId: user.id })
      .create()

    const result = await getPollResult({
      organisationSlug: organisation.slug,
      pollIdOrSlug: poll.slug,
      userId: user.id,
    })

    expect(result?.userParticipation?.id).toBe(simulation.id)
  })

  it('ignores a participation that is still being answered', async () => {
    const organisation = await organisationFactory.create()
    const poll = await createPollIn(organisation.id)
    const user = await userFactory.create()
    await simulationFactory
      .started()
      .withPollId(poll.id)
      .params({ userId: user.id })
      .create()

    const result = await getPollResult({
      organisationSlug: organisation.slug,
      pollIdOrSlug: poll.slug,
      userId: user.id,
    })

    expect(result?.userParticipation).toBeNull()
  })

  it('prefers the finished participation over a more recent unfinished one', async () => {
    const organisation = await organisationFactory.create()
    const poll = await createPollIn(organisation.id)
    const user = await userFactory.create()
    const finished = await simulationFactory
      .completed()
      .withPollId(poll.id)
      .params({ userId: user.id, date: new Date('2026-01-01') })
      .create()
    await simulationFactory
      .started()
      .withPollId(poll.id)
      .params({ userId: user.id, date: new Date('2026-06-01') })
      .create()

    const result = await getPollResult({
      organisationSlug: organisation.slug,
      pollIdOrSlug: poll.slug,
      userId: user.id,
    })

    expect(result?.userParticipation?.id).toBe(finished.id)
  })

  it('advertises the cooldown the participant count resolves to', async () => {
    const organisation = await organisationFactory.create()
    const poll = await createPollIn(organisation.id)

    const result = await getPollResult({
      organisationSlug: organisation.slug,
      pollIdOrSlug: poll.slug,
      userId: null,
    })

    // The default tiers recompute immediately below 100 participants.
    expect(result?.cooldownSeconds).toBe(0)
  })

  it('withholds the stats below the participation threshold', async () => {
    const organisation = await organisationFactory.create()
    const poll = await createPollIn(organisation.id, {
      computedResults: computedResultsFactory.valid().build(),
    })
    const belowThreshold = 2
    await Promise.all(
      Array.from({ length: belowThreshold }, () =>
        simulationFactory.completed().withPollId(poll.id).create()
      )
    )

    const result = await getPollResult({
      organisationSlug: organisation.slug,
      pollIdOrSlug: poll.slug,
      userId: null,
    })

    expect(result?.participants).toBe(belowThreshold)
    expect(result?.anonymity).toEqual({
      minParticipants: 3,
      isReached: false,
    })
    expect(result?.stats).toBeNull()
  })

  it('exposes the stats once three people took part', async () => {
    const organisation = await organisationFactory.create()
    const computedResults = computedResultsFactory.valid().build()
    const poll = await createPollIn(organisation.id, { computedResults })
    await Promise.all(
      Array.from({ length: 3 }, () =>
        simulationFactory.completed().withPollId(poll.id).create()
      )
    )

    const result = await getPollResult({
      organisationSlug: organisation.slug,
      pollIdOrSlug: poll.slug,
      userId: null,
    })

    expect(result?.anonymity).toEqual({ minParticipants: 3, isReached: true })
    expect(result?.stats).toEqual({ computedResults, funFacts: null })
  })

  it('has no stats until the worker computed them', async () => {
    const organisation = await organisationFactory.create()
    const poll = await createPollIn(organisation.id)
    await Promise.all(
      Array.from({ length: 3 }, () =>
        simulationFactory.completed().withPollId(poll.id).create()
      )
    )

    const result = await getPollResult({
      organisationSlug: organisation.slug,
      pollIdOrSlug: poll.slug,
      userId: null,
    })

    expect(result?.anonymity.isReached).toBe(true)
    expect(result?.stats).toBeNull()
  })
})

const createPollIn = (
  organisationId: string,
  poll: Parameters<typeof pollFactory.create>[0] = {}
) => pollFactory.create(poll, { transient: { organisationId } })
