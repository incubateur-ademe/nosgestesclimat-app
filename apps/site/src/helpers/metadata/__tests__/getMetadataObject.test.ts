import { describe, expect, it } from 'vitest'
import { getMetadataObject } from '../getMetadataObject'

const BASE_URL = 'https://nosgestesclimat.fr'

describe('getMetadataObject', () => {
  it('defaults languages from canonical when not explicitly provided, including x-default', () => {
    const result = getMetadataObject({
      locale: 'en',
      description: 'desc',
      alternates: { canonical: '/foo' },
    })

    expect(result.alternates).toEqual({
      canonical: `${BASE_URL}/en/foo`,
      languages: {
        fr: `${BASE_URL}/foo`,
        en: `${BASE_URL}/en/foo`,
        'x-default': `${BASE_URL}/foo`,
      },
    })
  })

  it('keeps an explicit languages map as-is, still locale-prefixing each entry, and derives x-default from the fr entry rather than the current-locale canonical (action-detail-page scenario, translated slugs)', () => {
    const result = getMetadataObject({
      locale: 'en',
      description: 'desc',
      alternates: {
        canonical: '/actions/theme/english-slug',
        languages: {
          fr: '/actions/theme/slug-francais',
          en: '/actions/theme/english-slug',
        },
      },
    })

    expect(result.alternates).toEqual({
      canonical: `${BASE_URL}/en/actions/theme/english-slug`,
      languages: {
        fr: `${BASE_URL}/actions/theme/slug-francais`,
        en: `${BASE_URL}/en/actions/theme/english-slug`,
        'x-default': `${BASE_URL}/actions/theme/slug-francais`,
      },
    })
    expect(result.alternates?.languages?.['x-default']).not.toBe(
      `${BASE_URL}/actions/theme/english-slug`
    )
  })

  it('restricts auto-derived languages to the provided locales list instead of every i18nConfig locale', () => {
    const result = getMetadataObject({
      locale: 'fr',
      description: 'desc',
      locales: ['fr'],
      alternates: { canonical: '/blog/category/untranslated-article' },
    })

    expect(result.alternates).toEqual({
      canonical: `${BASE_URL}/blog/category/untranslated-article`,
      languages: {
        fr: `${BASE_URL}/blog/category/untranslated-article`,
        'x-default': `${BASE_URL}/blog/category/untranslated-article`,
      },
    })
  })

  it('ignores the locales list when an explicit languages map is provided', () => {
    const result = getMetadataObject({
      locale: 'fr',
      description: 'desc',
      locales: ['fr'],
      alternates: {
        canonical: '/actions/theme/slug-francais',
        languages: {
          fr: '/actions/theme/slug-francais',
          en: '/actions/theme/english-slug',
        },
      },
    })

    expect(result.alternates?.languages).toEqual({
      fr: `${BASE_URL}/actions/theme/slug-francais`,
      en: `${BASE_URL}/en/actions/theme/english-slug`,
      'x-default': `${BASE_URL}/actions/theme/slug-francais`,
    })
  })

  it('only emits hreflang entries for the locales present in an explicit, partial languages map (action not yet translated into every locale)', () => {
    const result = getMetadataObject({
      locale: 'fr',
      description: 'desc',
      alternates: {
        canonical: '/actions/theme/slug-francais',
        languages: { fr: '/actions/theme/slug-francais' },
      },
    })

    expect(result.alternates).toEqual({
      canonical: `${BASE_URL}/actions/theme/slug-francais`,
      languages: {
        fr: `${BASE_URL}/actions/theme/slug-francais`,
        'x-default': `${BASE_URL}/actions/theme/slug-francais`,
      },
    })
  })

  it('omits canonical and languages entirely when alternates is not provided', () => {
    const result = getMetadataObject({ locale: 'fr', description: 'desc' })

    expect(result.alternates).toEqual({})
  })

  it('does not prefix the canonical path for the default locale (fr)', () => {
    const result = getMetadataObject({
      locale: 'fr',
      description: 'desc',
      alternates: { canonical: '/budget' },
    })

    expect(result.alternates?.canonical).toBe(`${BASE_URL}/budget`)
  })

  it('prefixes the canonical path with the locale for non-default locales', () => {
    const result = getMetadataObject({
      locale: 'en',
      description: 'desc',
      alternates: { canonical: '/budget' },
    })

    expect(result.alternates?.canonical).toBe(`${BASE_URL}/en/budget`)
  })
})
