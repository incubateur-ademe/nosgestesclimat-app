import { afterEach, describe, expect, it } from 'vitest'
import { prisma } from '../../../../prisma/client.ts'
import { actionFactory } from '../../factories/action.factory.ts'
import { getAction } from '../get-action.service.ts'

describe('getAction', () => {
  afterEach(async () => {
    await prisma.action.deleteMany()
  })

  it('returns null when no action matches the slug', async () => {
    const result = await getAction('non-existent-slug', 'fr')
    expect(result).toBeNull()
  })

  it('returns null when action is draft', async () => {
    const action = await actionFactory.draft().create()

    const result = await getAction(action.slug, 'fr')

    expect(result).toBeNull()
  })

  it('returns null when action is scheduled', async () => {
    const action = await actionFactory.scheduled().create()

    const result = await getAction(action.slug, 'fr')

    expect(result).toBeNull()
  })

  it('returns null when action is deleted', async () => {
    const action = await actionFactory.published().deleted().create()

    const result = await getAction(action.slug, 'fr')

    expect(result).toBeNull()
  })

  it('returns published action with null deletedAt', async () => {
    const action = await actionFactory.published().create()

    const result = await getAction(action.slug, 'fr')

    expect(result).toEqual(action)
  })

  it('returns published action with future deletedAt (pending deletion)', async () => {
    const action = await actionFactory.published().pendingDeletion().create()

    const result = await getAction(action.slug, 'fr')

    expect(result).toEqual(action)
  })

  describe('when locale is "en"', () => {
    it('returns null when the action has no English translation', async () => {
      const action = await actionFactory.published().create()

      const result = await getAction(action.slug, 'en')

      expect(result).toBeNull()
    })

    it('returns English content resolved from the translation', async () => {
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
      await actionFactory
        .published()
        .params({ tips: 'French tips' })
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

      const result = await getAction('english-slug', 'en')

      expect(result).toMatchObject({
        title: 'English title',
        slug: 'english-slug',
        longDescription: 'English description',
        tips: 'English tips',
        financialIncentives: 'English financial incentives',
        furtherExplore: 'English further explore',
        media,
        metadata,
        language: 'en',
      })
    })

    it('omits optional fields left untranslated, without falling back to French', async () => {
      await actionFactory
        .published()
        .params({ tips: 'French tips', financialIncentives: 'French aid' })
        .withTranslations({
          en: {
            title: 'English title',
            slug: 'english-slug-2',
            longDescription: 'English description',
            tips: null,
            financialIncentives: null,
          },
        })
        .create()

      const result = await getAction('english-slug-2', 'en')

      expect.assert(result)
      expect(result.tips).toBeUndefined()
      expect(result.financialIncentives).toBeUndefined()
    })
  })
})
