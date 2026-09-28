import { afterEach, describe, expect, it } from 'vitest'
import { prisma } from '../../../../prisma/client.ts'
import { emptyDatabase } from '../../../../test-utils/empty-database.ts'
import { organisationFactory } from '../../../organisations/factories/organisation.factory.ts'
import { pollFactory } from '../../../polls/factories/poll.factory.ts'
import { computedResultsFactory } from '../../../simulations/factories/computed-results.factory.ts'
import { simulationFactory } from '../../../simulations/factories/simulation.factory.ts'
import { userFactory } from '../../../users/factories/user.factory.ts'
import { getPollResult } from '../get-poll-result.service.ts'

describe('getPollResult', () => {
  afterEach(async () => {
    await emptyDatabase(prisma)
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
    const poll = await pollFactory.withOrganisation(organisation).create()
    const otherOrganisation = await organisationFactory.create()

    const result = await getPollResult({
      organisationSlug: otherOrganisation.slug,
      pollIdOrSlug: poll.slug,
      userId: null,
    })

    expect(result).toBeNull()
  })

  it('exposes the poll and its participant count', async () => {
    const organisation = await organisationFactory.create()
    const poll = await pollFactory
      .withOrganisation(organisation)
      .withParticipantsCount(2)
      .create()

    const result = await getPollResult({
      organisationSlug: organisation.slug,
      pollIdOrSlug: poll.slug,
      userId: null,
    })

    expect(result?.poll.id).toBe(poll.id)
    expect(result?.participantsCount).toBe(2)
  })

  it('resolves the poll by id', async () => {
    const organisation = await organisationFactory.create()
    const poll = await pollFactory.withOrganisation(organisation).create()

    const result = await getPollResult({
      organisationSlug: organisation.slug,
      pollIdOrSlug: poll.id,
      userId: null,
    })

    expect(result?.poll.id).toBe(poll.id)
  })

  it('has no user participation when there is no userId', async () => {
    const organisation = await organisationFactory.create()
    const poll = await pollFactory.withOrganisation(organisation).create()

    const result = await getPollResult({
      organisationSlug: organisation.slug,
      pollIdOrSlug: poll.slug,
      userId: null,
    })

    expect(result?.userParticipation).toBeNull()
  })

  it('exposes the user participation once finished', async () => {
    const organisation = await organisationFactory.create()
    const poll = await pollFactory.withOrganisation(organisation).create()
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
    const poll = await pollFactory.withOrganisation(organisation).create()
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

  it('prefers the most recent finished participation', async () => {
    const organisation = await organisationFactory.create()
    const poll = await pollFactory.withOrganisation(organisation).create()
    const user = await userFactory.create()
    await simulationFactory
      .completed()
      .withPollId(poll.id)
      .params({ userId: user.id, date: new Date('2026-01-01') })
      .create()
    const mostRecent = await simulationFactory
      .completed()
      .withPollId(poll.id)
      .params({ userId: user.id, date: new Date('2026-06-01') })
      .create()

    const result = await getPollResult({
      organisationSlug: organisation.slug,
      pollIdOrSlug: poll.slug,
      userId: user.id,
    })

    expect(result?.userParticipation?.id).toBe(mostRecent.id)
  })

  it('advertises the cooldown the participant count resolves to', async () => {
    const organisation = await organisationFactory.create()
    const poll = await pollFactory.withOrganisation(organisation).create()

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
    const belowThreshold = 2
    const poll = await pollFactory
      .withOrganisation(organisation)
      .withParticipantsCount(belowThreshold)
      .create({ computedResults: computedResultsFactory.valid().build() })

    const result = await getPollResult({
      organisationSlug: organisation.slug,
      pollIdOrSlug: poll.slug,
      userId: null,
    })

    expect(result?.participantsCount).toBe(belowThreshold)
    expect(result?.anonymity).toEqual({
      minParticipants: 3,
      isReached: false,
    })
    expect(result?.stats).toBeNull()
  })

  it('exposes the stats once three people took part', async () => {
    const organisation = await organisationFactory.create()
    const computedResults = computedResultsFactory.valid().build()
    const poll = await pollFactory
      .withOrganisation(organisation)
      .withParticipantsCount(3)
      .create({ computedResults })

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
    const poll = await pollFactory
      .withOrganisation(organisation)
      .withParticipantsCount(3)
      .create()

    const result = await getPollResult({
      organisationSlug: organisation.slug,
      pollIdOrSlug: poll.slug,
      userId: null,
    })

    expect(result?.anonymity.isReached).toBe(true)
    expect(result?.stats).toBeNull()
  })
})
