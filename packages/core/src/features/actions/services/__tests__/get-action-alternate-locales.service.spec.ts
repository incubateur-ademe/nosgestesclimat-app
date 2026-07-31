import { afterEach, describe, expect, it } from 'vitest'
import { prisma } from '../../../../prisma/client.ts'
import { themesById } from '../../data/themes/index.ts'
import { actionFactory } from '../../factories/action.factory.ts'
import { getActionAlternateLocales } from '../get-action-alternate-locales.service.ts'

describe('getActionAlternateLocales', () => {
  afterEach(async () => {
    await prisma.action.deleteMany()
  })

  it('returns only the locales the action has a translation for', async () => {
    const action = await actionFactory.published().create()

    const result = await getActionAlternateLocales(action.slug)

    expect(result).toEqual({
      fr: { actionSlug: action.slug, themeSlug: action.theme.slug },
    })
  })

  it('includes every locale with a genuine translation, each with its own slugs', async () => {
    const action = await actionFactory
      .published()
      .withTranslations({
        en: {
          title: 'English title',
          slug: 'english-slug',
          longDescription: 'English description',
        },
      })
      .create()

    const result = await getActionAlternateLocales(action.slug)

    const theme = themesById[action.theme.id]

    expect(result).toEqual({
      fr: { actionSlug: action.slug, themeSlug: theme.slug },
      en: { actionSlug: 'english-slug', themeSlug: theme.slugEn },
    })
  })

  it('resolves the action from any locale slug, not just the default locale', async () => {
    const action = await actionFactory
      .published()
      .withTranslations({
        en: {
          title: 'English title',
          slug: 'english-slug',
          longDescription: 'English description',
        },
      })
      .create()

    const result = await getActionAlternateLocales('english-slug')

    const theme = themesById[action.theme.id]

    expect(result).toEqual({
      fr: { actionSlug: action.slug, themeSlug: theme.slug },
      en: { actionSlug: 'english-slug', themeSlug: theme.slugEn },
    })
  })

  it('returns an empty object when no visible action matches the slug', async () => {
    const result = await getActionAlternateLocales('does-not-exist')

    expect(result).toEqual({})
  })

  it.each([
    ['draft', () => actionFactory.draft()],
    ['scheduled', () => actionFactory.scheduled()],
    ['deleted', () => actionFactory.published().deleted()],
  ])('returns an empty object when the action is %s', async (_, factory) => {
    const action = await factory().create()

    const result = await getActionAlternateLocales(action.slug)

    expect(result).toEqual({})
  })
})
