import { afterEach, describe, expect, it } from 'vitest'
import { prisma } from '../../../../prisma/client.ts'
import { actionFactory } from '../../factories/action.factory.ts'
import { getPublicActionsCatalogue } from '../get-public-actions-catalogue.service.ts'

describe('getPublicActionsCatalogue', () => {
  afterEach(async () => {
    await prisma.action.deleteMany()
  })

  it('returns no actions and no top actions when there are no actions', async () => {
    const result = await getPublicActionsCatalogue('fr')
    expect(result.actions).toEqual([])
    expect(result.topActions).toEqual([])
  })

  it('returns all visible actions, without any personalization', async () => {
    const action = await actionFactory.published().create()

    const result = await getPublicActionsCatalogue('fr')
    expect(result.actions).toEqual([expect.objectContaining({ id: action.id })])
  })

  it('returns actions ordered by title ascending', async () => {
    await Promise.all([
      actionFactory.published().params({ title: 'Zebra action' }).create(),
      actionFactory.published().params({ title: 'Alpha action' }).create(),
      actionFactory.published().params({ title: 'Middle action' }).create(),
    ])

    const result = await getPublicActionsCatalogue('fr')
    expect(result.actions.map((a) => a.title)).toEqual([
      'Alpha action',
      'Middle action',
      'Zebra action',
    ])
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

      const result = await getPublicActionsCatalogue('fr')

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

      const result = await getPublicActionsCatalogue('fr')

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

    const result = await getPublicActionsCatalogue('fr')
    expect(result).toEqual({
      actions: [],
      topActions: [],
    })
  })

  describe('when locale is "en"', () => {
    it('hides actions with no English translation', async () => {
      await actionFactory.published().create()

      const result = await getPublicActionsCatalogue('en')

      expect(result.actions).toEqual([])
      expect(result.topActions).toEqual([])
    })

    it('includes actions with an English translation, using its content', async () => {
      const media = {
        type: 'image',
        title: 'English media title',
        src: 'https://example.com/image.jpg',
        alt: 'alt text',
      } as const
      const metadata = {
        title: 'English SEO title',
        description: 'English SEO description',
        jsonLd: { '@context': 'https://schema.org', '@graph': [] },
      } as const
      const action = await actionFactory
        .published()
        .withTranslations({
          en: {
            title: 'English title',
            slug: 'english-slug',
            longDescription: 'English description',
            tips: 'English tips',
            financialIncentives: 'English financial incentives',
            furtherExplore: 'English further explore',
            media,
            metadata,
          },
        })
        .create()
      await actionFactory.published().create() // untranslated, must be excluded

      const result = await getPublicActionsCatalogue('en')

      expect(result.actions).toEqual([
        expect.objectContaining({
          id: action.id,
          title: 'English title',
          longDescription: 'English description',
          tips: 'English tips',
          financialIncentives: 'English financial incentives',
          furtherExplore: 'English further explore',
          media,
          metadata,
        }),
      ])
    })

    it('highlights curated actions by their English slug', async () => {
      const avion = await actionFactory
        .published()
        .params({ slug: 'limiter-avion' })
        .withTranslations({
          en: {
            title: 'Limit flying',
            slug: 'reduce-flying',
            longDescription: 'English description',
          },
        })
        .create()
      // highlighted but untranslated: hidden from the English catalogue,
      // including its top actions
      await actionFactory
        .published()
        .params({ slug: 'limiter-viande' })
        .create()

      const result = await getPublicActionsCatalogue('en')

      expect(result.topActions).toEqual([
        expect.objectContaining({ id: avion.id, title: 'Limit flying' }),
      ])
    })
  })
})
