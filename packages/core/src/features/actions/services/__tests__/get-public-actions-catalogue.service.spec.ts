import { afterEach, describe, expect, it } from 'vitest'
import { prisma } from '../../../../prisma/client.ts'
import { actionFactory } from '../../factories/action.factory.ts'
import { getPublicActionsCatalogue } from '../get-public-actions-catalogue.service.ts'

describe('getPublicActionsCatalogue', () => {
  afterEach(async () => {
    await prisma.action.deleteMany()
  })

  it('returns no actions and no top actions when there are no actions', async () => {
    const result = await getPublicActionsCatalogue()
    expect(result.actions).toEqual([])
    expect(result.topActions).toEqual([])
  })

  it('returns all visible actions, without any personalization', async () => {
    const action = await actionFactory.published().create()

    const result = await getPublicActionsCatalogue()
    expect(result.actions).toEqual([expect.objectContaining({ id: action.id })])
  })

  describe('topActions', () => {
    it('returns the curated highlighted actions in their fixed order, regardless of creation order', async () => {
      const [viande, avion, trajets] = await Promise.all([
        actionFactory.published().params({ slug: 'limiter-viande' }).create(),
        actionFactory.published().params({ slug: 'limiter-avion' }).create(),
        actionFactory
          .published()
          .params({ slug: 'petits-trajets-sans-voiture' })
          .create(),
      ])

      const result = await getPublicActionsCatalogue()

      expect(result.topActions).toEqual([
        expect.objectContaining({ id: avion.id }),
        expect.objectContaining({ id: trajets.id }),
        expect.objectContaining({ id: viande.id }),
      ])
    })

    it('skips curated slugs that have no matching visible action', async () => {
      const avion = await actionFactory
        .published()
        .params({ slug: 'limiter-avion' })
        .create()

      const result = await getPublicActionsCatalogue()

      expect(result.topActions).toEqual([
        expect.objectContaining({ id: avion.id }),
      ])
    })
  })

  it('excludes deleted and unpublished actions', async () => {
    await Promise.all([
      actionFactory.draft().create(),
      actionFactory.published().scheduled().create(),
      actionFactory.published().deleted().create(),
    ])

    const result = await getPublicActionsCatalogue()
    expect(result).toEqual({
      actions: [],
      topActions: [],
    })
  })
})
