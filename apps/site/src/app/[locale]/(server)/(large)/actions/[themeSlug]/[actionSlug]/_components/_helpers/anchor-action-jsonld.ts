import { ACTION_DETAIL_PATH, ACTIONS_PATH } from '@/constants/urls/paths'
import { getLocalizedPath } from '@/helpers/language/getLocalizedPath'
import { getSiteUrl } from '@/helpers/metadata/getSiteUrl'
import type { Action } from '@nosgestesclimat/core/features/actions/types/action'

type Node = Record<string, unknown>

const BREADCRUMB_LABELS: Record<
  Action['language'],
  { home: string; actions: string }
> = {
  fr: { home: 'Accueil', actions: 'Actions' },
  en: { home: 'Home', actions: 'Actions' },
}

/** Re-anchors the CMS document on the page served. */
export function anchorActionJsonLd(action: Action): Node[] {
  const document = action.metadata.jsonLd
  if (!document) return []

  const siteUrl = getSiteUrl()
  const actionUrl = `${siteUrl}${getLocalizedPath(
    action.language,
    ACTION_DETAIL_PATH(action.theme.slug, action.slug)
  )}`
  const pageId = `${actionUrl}#webpage`
  const breadcrumbId = `${actionUrl}#breadcrumb`
  const labels = BREADCRUMB_LABELS[action.language]

  const nodes = (
    Array.isArray(document['@graph']) ? document['@graph'] : [document]
  )
    .filter(isNode)
    .map((node) => {
      if (hasType(node, 'BreadcrumbList')) {
        return {
          ...node,
          '@id': breadcrumbId,
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: labels.home,
              item: `${siteUrl}/`,
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: labels.actions,
              item: `${siteUrl}${getLocalizedPath(action.language, ACTIONS_PATH)}`,
            },
            {
              '@type': 'ListItem',
              position: 3,
              name: action.title,
              item: actionUrl,
            },
          ],
        }
      }

      if (!isPageNode(node)) {
        const isPartOf = node.isPartOf

        return isNode(isPartOf) && String(isPartOf['@id']).endsWith('#webpage')
          ? { ...node, isPartOf: { '@id': pageId } }
          : node
      }

      const { hasPart, ...rest } = node

      return {
        ...rest,
        '@type': 'WebPage',
        '@id': pageId,
        url: actionUrl,
        inLanguage: action.language,
        ...(hasPart ? { mainEntity: hasPart } : {}),
        ...(isNode(node.breadcrumb)
          ? { breadcrumb: { '@id': breadcrumbId } }
          : {}),
      }
    })

  return [{ ...document, '@graph': nodes }]
}

const isNode = (value: unknown): value is Node =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const hasType = (node: Node, type: string) =>
  [node['@type']].flat().includes(type)

const isPageNode = (node: Node) => String(node['@type']).endsWith('Page')
