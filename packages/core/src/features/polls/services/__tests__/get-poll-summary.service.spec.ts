import { afterEach, describe, expect, it } from 'vitest'
import { prisma } from '../../../../prisma/client.ts'
import { pollFactory } from '../../factories/poll.factory.ts'
import { getPollSummary } from '../get-poll-summary.service.ts'

describe('getPollSummary', () => {
  afterEach(async () => {
    await prisma.poll.deleteMany()
    await prisma.organisation.deleteMany()
  })

  it('returns null when no poll matches', async () => {
    const result = await getPollSummary({ pollIdOrSlug: 'does-not-exist' })

    expect(result).toBeNull()
  })

  it('finds the poll by id', async () => {
    const poll = await pollFactory.create()

    const result = await getPollSummary({ pollIdOrSlug: poll.id })

    expect(result).toEqual(expect.objectContaining({ id: poll.id }))
  })

  it('finds the poll by slug', async () => {
    const poll = await pollFactory.create()

    const result = await getPollSummary({ pollIdOrSlug: poll.slug })

    expect(result).toEqual(expect.objectContaining({ id: poll.id }))
  })

  it('does not find a poll whose slug is shaped like a poll id', async () => {
    // accepted trade-off of resolving the identifier before the query: an
    // identifier shaped like a cuid is looked up as an id only, so a slug that
    // happens to look like one is missed
    const poll = await pollFactory.create({
      slug: 'cslugthatlookslikeapollid',
    })

    const result = await getPollSummary({ pollIdOrSlug: poll.slug })

    expect(result).toBeNull()
  })

  it('exposes the poll, how it runs, and its organisation', async () => {
    const poll = await pollFactory.create({
      mode: 'scolaire',
      expectedNumberOfParticipants: 42,
    })

    const result = await getPollSummary({ pollIdOrSlug: poll.slug })

    expect(result).toEqual({
      id: poll.id,
      name: poll.name,
      slug: poll.slug,
      mode: 'scolaire',
      organisation: {
        name: poll.organisation.name,
        slug: poll.organisation.slug,
      },
    })
  })
})
