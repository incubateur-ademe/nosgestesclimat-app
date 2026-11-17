import { ACTION_DETAIL_PATH, ACTIONS_PATH } from '@/constants/urls/paths'
import { getLocalizedPath } from '@/helpers/language/getLocalizedPath'
import { getSiteUrl } from '@/helpers/metadata/getSiteUrl'
import type { Locale } from '@/i18nConfig'
import type { Action } from '@nosgestesclimat/core/features/actions/types/action'

/** Values and ids resolved once for the page, shared by every node builder. */
export interface ActionJsonLdContext {
  locale: Locale
  actionUrl: string
  actionsUrl: string
  homeUrl: string
  websiteId: string
  pageId: string
  breadcrumbId: string
  /** Title as published, the breadcrumb does not use the SEO override */
  actionTitle: string
  name: string
  description: string
  image?: string
  datePublished?: string
}

export function buildActionJsonLdContext(
  action: Action,
  locale: Locale
): ActionJsonLdContext {
  const siteUrl = getSiteUrl()
  const actionUrl = `${siteUrl}${getLocalizedPath(
    locale,
    ACTION_DETAIL_PATH(action.theme.slug, action.slug)
  )}`

  return {
    locale,
    actionUrl,
    actionsUrl: `${siteUrl}${getLocalizedPath(locale, ACTIONS_PATH)}`,
    homeUrl: `${siteUrl}/`,
    websiteId: `${siteUrl}/#website`,
    pageId: `${actionUrl}#webpage`,
    breadcrumbId: `${actionUrl}#breadcrumb`,
    actionTitle: action.title,
    name: action.metadata.title ?? action.title,
    description:
      action.metadata.description ??
      action.description ??
      action.longDescription,
    image: resolveImage(action, siteUrl),
    datePublished: action.publishedAt?.toISOString(),
  }
}

function resolveImage(action: Action, siteUrl: string) {
  if (action.media?.type !== 'image') return undefined

  const { src } = action.media
  if (/^https?:\/\//.test(src)) return src

  return `${siteUrl}${src.startsWith('/') ? src : `/${src}`}`
}
