import { GUIDE_CATEGORIES } from '@/app/[locale]/(server)/(narrow)/guide/guideCategories'
import { ACTIONS_PATH } from '@/constants/urls/paths'
import { getLocalizedPath } from '@/helpers/language/getLocalizedPath'
import { getPosts } from '@/helpers/markdown/getPosts'
import { getCachedRules } from '@/helpers/modelFetching/getCachedRules'
import i18nConfig, { type Locale } from '@/i18nConfig'
import { fetchAllArticleTitlesAndSlugs } from '@/services/cms/fetchAllArticleTitlesAndSlugs'
import { fetchThematicLandingPages } from '@/services/cms/fetchThematicLandingPages'
import type { NGCRule } from '@incubateur-ademe/nosgestesclimat'
import { findVisibleActionSlugs } from '@nosgestesclimat/core/features/actions/repositories/actions.repository'
import type { MetadataRoute } from 'next'
import { utils } from 'publicodes'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [
    documentationUrls,
    blogUrls,
    releaseUrls,
    thematicLandingUrls,
    actionDetailUrls,
  ] = await Promise.all([
    getDocumentationUrls(),
    getBlogUrls(),
    getReleaseUrls(),
    getThematicLandingUrls(),
    getActionDetailUrls(),
  ])

  return [
    ...buildLocalizedEntries(STATIC_PATHS, 0.8),
    ...getGuideUrls(),
    ...documentationUrls,
    ...blogUrls,
    ...releaseUrls,
    ...thematicLandingUrls,
    ...actionDetailUrls,
  ]
}

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL

// Intersecting `Config['locales']` (readonly string[]) with `Locale[]` on i18nConfig's
// declared type confuses inference on .map/.flatMap callbacks; a locally-typed copy fixes it.
const LOCALES: Locale[] = i18nConfig.locales

const STATIC_PATHS = [
  '',
  'accessibilite',
  'blog',
  'budget',
  'cgu',
  'contact',
  'diffuser',
  'documentation',
  'empreinte-carbone',
  'empreinte-eau',
  'international',
  'mentions-legales',
  'mentions-legales-base-empreinte',
  'nos-relais',
  'nouveautes',
  'organisations',
  'plan-du-site',
  'politique-de-confidentialite',
  'questions',
  'questions-frequentes',
  'stats',
  ACTIONS_PATH,
]

type SitemapEntry = MetadataRoute.Sitemap[number]

const buildUrl = (locale: Locale, path: string): string =>
  `${BASE_URL}${getLocalizedPath(locale, path)}`

// Parses a source-provided date string, dropping it if missing or invalid
// rather than falling back to "now" — an inaccurate lastModified is worse
// than none, since it can make crawlers distrust the signal entirely.
const toDate = (value?: string | null): Date | undefined => {
  if (!value) {
    return undefined
  }
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : date
}

function buildLocalizedEntries(
  paths: string[],
  priority: number
): SitemapEntry[] {
  // Static routes have no backing content record, so there's no real
  // modification date to report — omit rather than stamp them with "now".
  return LOCALES.flatMap((locale) =>
    paths.map((path) => ({
      url: buildUrl(locale, path.startsWith('/') ? path : `/${path}`),
      priority,
    }))
  )
}

/** French only */
function getGuideUrls(): SitemapEntry[] {
  return GUIDE_CATEGORIES.map((category) => ({
    url: buildUrl(i18nConfig.defaultLocale, `/guide/${category}`),
    priority: 0.6,
  }))
}

async function getDocumentationUrls(): Promise<SitemapEntry[]> {
  const entriesByLocale = await Promise.all(
    LOCALES.map(async (locale) => {
      const rules = await getCachedRules({ locale, isOptim: false })
      return (Object.entries(rules) as [string, NGCRule | null | undefined][])
        .filter(([, rule]) => Boolean(rule?.titre))
        .map(([dottedName]) => ({
          url: buildUrl(
            locale,
            `/documentation/${utils.encodeRuleName(dottedName)}`
          ),
          priority: 0.8,
        }))
    })
  )

  return entriesByLocale.flat()
}

async function getBlogUrls(): Promise<SitemapEntry[]> {
  const entriesByLocale = await Promise.all(
    LOCALES.map(async (locale) => {
      const posts = await fetchAllArticleTitlesAndSlugs({ locale })
      return posts.map((post) => ({
        url: buildUrl(locale, `/blog/${post.blogCategory?.slug}/${post.slug}`),
        lastModified: toDate(post.updatedAt),
        priority: 1,
      }))
    })
  )

  return entriesByLocale.flat()
}

async function getReleaseUrls(): Promise<SitemapEntry[]> {
  const entriesByLocale = await Promise.all(
    LOCALES.map(async (locale) => {
      const posts = await getPosts(locale)
      return posts.map((post) => ({
        url: buildUrl(locale, `/nouveautes/${post.slug}`),
        lastModified: toDate(post.data.date),
        priority: 0.6,
      }))
    })
  )

  return entriesByLocale.flat()
}

/** French only */
async function getThematicLandingUrls(): Promise<SitemapEntry[]> {
  const result = await fetchThematicLandingPages()

  return (result?.thematicLandingPages ?? []).map((page) => ({
    url: buildUrl(i18nConfig.defaultLocale, `/themes/${page.slug}`),
    lastModified: toDate(page.updatedAt),
    priority: 0.8,
  }))
}

async function getActionDetailUrls(): Promise<SitemapEntry[]> {
  const entriesByLocale = await Promise.all(
    LOCALES.map(async (locale) => {
      const visibleActionSlugs = await findVisibleActionSlugs(locale)
      return visibleActionSlugs.map((action) => ({
        url: buildUrl(locale, `/actions/${action.themeSlug}/${action.slug}`),
        lastModified: action.updatedAt,
        priority: 1,
      }))
    })
  )

  return entriesByLocale.flat()
}
