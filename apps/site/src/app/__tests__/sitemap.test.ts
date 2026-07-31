import type { Locale } from '@/i18nConfig'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Matches NEXT_PUBLIC_SITE_URL set in vitest.config.ts
const BASE_URL = 'http://localhost:3000'

vi.mock('@/helpers/markdown/getPosts', () => ({
  getPosts: vi.fn((folderPath: string) =>
    Promise.resolve([
      {
        slug: `release-${folderPath.includes('/en/') ? 'en' : 'fr'}`,
        data: { date: '2024-01-15T00:00:00Z' },
      },
    ])
  ),
}))

vi.mock('@/services/cms/fetchAllArticleTitlesAndSlugs', () => ({
  fetchAllArticleTitlesAndSlugs: vi.fn(({ locale }: { locale: Locale }) =>
    Promise.resolve([
      {
        slug: `article-${locale}`,
        blogCategory: { slug: `category-${locale}` },
        updatedAt: '2024-02-20T00:00:00Z',
      },
    ])
  ),
}))

vi.mock('@/services/cms/fetchThematicLandingPages', () => ({
  fetchThematicLandingPages: vi.fn(() =>
    Promise.resolve({
      thematicLandingPages: [
        {
          id: '1',
          title: 'Theme',
          slug: 'un-theme',
          updatedAt: '2024-03-10T00:00:00Z',
        },
      ],
    })
  ),
}))

vi.mock('@/helpers/modelFetching/getCachedRules', () => ({
  getCachedRules: vi.fn(({ locale }: { locale: Locale }) =>
    Promise.resolve({
      [`rule . ${locale}`]: { titre: `Rule ${locale}` },
      'rule . no title': {},
    })
  ),
}))

vi.mock(
  '@nosgestesclimat/core/features/actions/repositories/actions.repository',
  () => ({
    findVisibleActionSlugs: vi.fn((locale: Locale) =>
      Promise.resolve([
        {
          slug: `action-${locale}`,
          themeSlug: 'theme',
          updatedAt: new Date('2024-04-05T00:00:00Z'),
        },
      ])
    ),
  })
)

describe('sitemap', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('builds the full sitemap with correctly grouped, localised, and dated URLs', async () => {
    const { default: sitemap } = await import('../sitemap')
    const entries = await sitemap()
    const urls = entries.map((entry) => entry.url)
    const byUrl = (url: string) => entries.find((entry) => entry.url === url)

    // Static pages: emitted for both fr (unprefixed) and en (prefixed with /en);
    // no backing content record -> no fabricated "now" date
    expect(urls).toContain(`${BASE_URL}/documentation`)
    expect(urls).toContain(`${BASE_URL}/en/documentation`)
    expect(byUrl(`${BASE_URL}/documentation`)?.lastModified).toBeUndefined()
    expect(urls).toContain(`${BASE_URL}/accessibilite`)
    expect(urls).toContain(`${BASE_URL}/en/accessibilite`)

    // Static pages: never include pruned paths (auth-gated or dead entries)
    expect(urls.some((url) => url.includes('personas'))).toBe(false)
    expect(urls.some((url) => url.includes('mon-espace'))).toBe(false)

    // Documentation rule pages (publicodes encodeRuleName turns " . " into "/"),
    // localised, titleless rules excluded, no fabricated "now" date
    expect(urls).toContain(`${BASE_URL}/documentation/rule/fr`)
    expect(urls).toContain(`${BASE_URL}/en/documentation/rule/en`)
    expect(urls.some((url) => url.includes('no-title'))).toBe(false)
    expect(
      byUrl(`${BASE_URL}/documentation/rule/fr`)?.lastModified
    ).toBeUndefined()

    // Blog posts: localised, real per-item date surfaced as a Date instance
    expect(urls).toContain(`${BASE_URL}/blog/category-fr/article-fr`)
    expect(urls).toContain(`${BASE_URL}/en/blog/category-en/article-en`)
    expect(
      byUrl(`${BASE_URL}/blog/category-fr/article-fr`)?.lastModified
    ).toEqual(new Date('2024-02-20T00:00:00Z'))

    // Release notes: localised, real per-item date surfaced as a Date instance
    expect(urls).toContain(`${BASE_URL}/nouveautes/release-fr`)
    expect(urls).toContain(`${BASE_URL}/en/nouveautes/release-en`)
    expect(byUrl(`${BASE_URL}/nouveautes/release-fr`)?.lastModified).toEqual(
      new Date('2024-01-15T00:00:00Z')
    )

    // Action detail pages: localised, real per-item date surfaced as a Date instance
    expect(urls).toContain(`${BASE_URL}/actions/theme/action-fr`)
    expect(urls).toContain(`${BASE_URL}/en/actions/theme/action-en`)
    expect(byUrl(`${BASE_URL}/actions/theme/action-fr`)?.lastModified).toEqual(
      new Date('2024-04-05T00:00:00Z')
    )

    // Thematic landing pages: French only, never /en/themes/..., real date surfaced
    expect(urls).toContain(`${BASE_URL}/themes/un-theme`)
    expect(urls.some((url) => url.includes('/en/themes/'))).toBe(false)
    expect(byUrl(`${BASE_URL}/themes/un-theme`)?.lastModified).toEqual(
      new Date('2024-03-10T00:00:00Z')
    )

    // Guide category pages: French only, never /en/guide/...
    expect(urls).toContain(`${BASE_URL}/guide/alimentation`)
    expect(urls).toContain(`${BASE_URL}/guide/transport`)
    expect(urls.some((url) => url.includes('/en/guide/'))).toBe(false)
  })
})
