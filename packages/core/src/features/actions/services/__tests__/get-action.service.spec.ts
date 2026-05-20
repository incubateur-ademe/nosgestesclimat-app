import { afterEach, describe, expect, it } from 'vitest'
import { prisma } from '../../../../prisma/client.ts'
import { actionFactory } from '../../factories/action.factory.ts'
import { getAction } from '../get-action.service.ts'

describe('getAction', () => {
  afterEach(async () => {
    await prisma.action.deleteMany()
  })

  it('returns null when no action matches the slug', async () => {
    const result = await getAction('non-existent-slug')
    expect(result).toBeNull()
  })

  it('returns null when action is draft', async () => {
    const action = await actionFactory.draft().create()

    const result = await getAction(action.slug)

    expect(result).toBeNull()
  })

  it('returns null when action is scheduled', async () => {
    const action = await actionFactory.scheduled().create()

    const result = await getAction(action.slug)

    expect(result).toBeNull()
  })

  it('returns null when action is deleted', async () => {
    const action = await actionFactory.published().deleted().create()

    const result = await getAction(action.slug)

    expect(result).toBeNull()
  })

  it('returns published action with null deletedAt', async () => {
    const action = await actionFactory.published().create()

    const result = await getAction(action.slug)

    expect(result).toEqual({
      id: action.id,
      title: action.title,
      slug: action.slug,
      trackingId: action.trackingId,
      language: 'fr',
      longDescription: action.longDescription,
      theme: {
        id: action.theme.id,
        key: action.theme.key,
        trackingId: action.theme.trackingId,
        title: action.theme.title,
        emoji: action.theme.emoji,
      },
      ruleId: action.ruleId,
      media: action.media,
      tips: action.tips,
      financialIncentives: action.financialIncentives,
      furtherExplore: action.furtherExplore,
      metadata: action.metadata,
    })
  })

  it('returns published action with future deletedAt (pending deletion)', async () => {
    const action = await actionFactory.published().pendingDeletion().create()

    const result = await getAction(action.slug)

    expect(result).toEqual({
      id: action.id,
      title: action.title,
      slug: action.slug,
      trackingId: action.trackingId,
      language: 'fr',
      longDescription: action.longDescription,
      theme: {
        id: action.theme.id,
        key: action.theme.key,
        trackingId: action.theme.trackingId,
        title: action.theme.title,
        emoji: action.theme.emoji,
      },
      ruleId: action.ruleId,
      media: action.media,
      tips: action.tips,
      financialIncentives: action.financialIncentives,
      furtherExplore: action.furtherExplore,
      metadata: action.metadata,
    })
  })
})
