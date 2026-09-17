import { afterEach, describe, expect, it } from 'vitest'
import { prisma } from '../../../../prisma/client.ts'
import { computedResultsFactory } from '../../../simulations/factories/computed-results.factory.ts'
import { pollFactory } from '../../factories/poll.factory.ts'
import { getPoll } from '../get-poll.service.ts'

describe('getPoll', () => {
  afterEach(async () => {
    await prisma.poll.deleteMany()
    await prisma.organisation.deleteMany()
  })

  it('returns null when no poll matches', async () => {
    const result = await getPoll({ pollIdOrSlug: 'does-not-exist' })

    expect(result).toBeNull()
  })

  it('finds the poll by id', async () => {
    const poll = await pollFactory.create()

    const result = await getPoll({ pollIdOrSlug: poll.id })

    expect(result).toEqual(expect.objectContaining({ id: poll.id }))
  })

  it('finds the poll by slug', async () => {
    const poll = await pollFactory.create()

    const result = await getPoll({ pollIdOrSlug: poll.slug })

    expect(result).toEqual(expect.objectContaining({ id: poll.id }))
  })

  it('does not find a poll whose slug is shaped like a poll id', async () => {
    // accepted trade-off of resolving the identifier before the query: an
    // identifier shaped like a cuid is looked up as an id only, so a slug that
    // happens to look like one is missed
    const poll = await pollFactory.create({
      slug: 'cslugthatlookslikeapollid',
    })

    const result = await getPoll({ pollIdOrSlug: poll.slug })

    expect(result).toBeNull()
  })

  it('exposes the poll and its organisation', async () => {
    const computedResults = computedResultsFactory.valid().build()
    const poll = await pollFactory.create({
      mode: 'scolaire',
      expectedNumberOfParticipants: 42,
      computedResults,
    })

    const result = await getPoll({ pollIdOrSlug: poll.slug })

    expect(result).toEqual({
      id: poll.id,
      name: poll.name,
      slug: poll.slug,
      mode: 'scolaire',
      expectedNumberOfParticipants: 42,
      funFacts: null,
      computedResults,
      createdAt: poll.createdAt,
      updatedAt: poll.updatedAt,
      organisation: poll.organisation,
    })
  })
})
