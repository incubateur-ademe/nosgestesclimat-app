import { afterEach, describe, expect, it } from 'vitest'
import { prisma } from '../../../../prisma/client.ts'
import { actionFactory } from '../../factories/action.factory.ts'
import { getActions } from '../get-actions.service.ts'

describe('getActions', () => {
  afterEach(async () => {
    await prisma.action.deleteMany()
  })

  it('returns empty array when there are no actions', async () => {
    const actions = await getActions()
    expect(actions).toEqual([])
  })

  it('returns only published and non-deleted actions', async () => {
    const published = await actionFactory.published().create()
    const [publishedPendingDeletion] = await Promise.all([
      actionFactory.published().pendingDeletion().create(),
      // Other states that should be ignored
      actionFactory.draft().create(),
      actionFactory.draft().pendingDeletion().create(),
      actionFactory.draft().deleted().create(),
      actionFactory.scheduled().create(),
      actionFactory.scheduled().pendingDeletion().create(),
      actionFactory.scheduled().deleted().create(),
      actionFactory.published().deleted().create(),
    ])

    const actions = await getActions()

    expect(actions).toEqual(
      [published, publishedPendingDeletion].map((a) => ({
        id: a.id,
        title: a.title,
        slug: a.slug,
        trackingId: a.trackingId,
        language: a.language,
        longDescription: a.longDescription,
        theme: a.theme,
        ruleId: a.ruleId,
        media: a.media,
        tips: a.tips,
        financialIncentives: a.financialIncentives,
        furtherExplore: a.furtherExplore,
        metadata: a.metadata,
      }))
    )
  })
})
