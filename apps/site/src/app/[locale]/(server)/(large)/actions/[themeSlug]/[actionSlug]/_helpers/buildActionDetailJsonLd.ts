import { ACTION_DETAIL_PATH, ACTIONS_PATH } from '@/constants/urls/paths'
import { publicEnv } from '@/env/public'
import { getLocalizedPath } from '@/helpers/language/getLocalizedPath'
import type { Locale } from '@/i18nConfig'
import type { Action } from '@nosgestesclimat/core/features/actions/types/action'

type JsonLdNode = Record<string, unknown>

const URL_KEYS = new Set([
  '@context',
  '@id',
  'url',
  'item',
  'sameAs',
  'contentUrl',
  'embedUrl',
])

const ADEME_ORGANIZATION_ID = 'https://www.ademe.fr/#organization'

const BREADCRUMB_LABELS = {
  fr: { home: 'Accueil', actions: 'Actions' },
  en: { home: 'Home', actions: 'Actions' },
}

export function buildActionDetailJsonLd(
  action: Action,
  locale: Locale
): JsonLdNode[] {
  const siteUrl = publicEnv.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, '')
  const actionUrl = `${siteUrl}${getLocalizedPath(
    locale,
    ACTION_DETAIL_PATH(action.theme.slug, action.slug)
  )}`
  const actionsUrl = `${siteUrl}${getLocalizedPath(locale, ACTIONS_PATH)}`
  const homeUrl = `${siteUrl}/`
  const websiteId = `${siteUrl}/#website`
  const pageId = `${actionUrl}#webpage`
  const breadcrumbId = `${actionUrl}#breadcrumb`
  const inLanguage = locale === 'fr' ? 'fr-FR' : 'en-GB'
  const breadcrumbOptions = {
    actionTitle: action.title,
    actionUrl,
    actionsUrl,
    homeUrl,
    locale,
  }
  const storedJsonLd = asNode(action.metadata.jsonLd)

  if (!storedJsonLd) {
    const name = action.metadata.title ?? action.title
    const description =
      action.metadata.description ??
      action.description ??
      action.longDescription

    return [
      {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'CollectionPage',
            '@id': pageId,
            url: actionUrl,
            name,
            description,
            inLanguage,
            isPartOf: { '@id': websiteId },
            about: { '@id': ADEME_ORGANIZATION_ID },
            isAccessibleForFree: true,
            breadcrumb: { '@id': breadcrumbId },
            hasPart: { '@id': actionUrl },
          },
          {
            '@type': 'BreadcrumbList',
            '@id': breadcrumbId,
            itemListElement: buildBreadcrumbItems({}, breadcrumbOptions),
          },
          {
            '@type': 'WebSite',
            '@id': websiteId,
            url: homeUrl,
            name: 'Nos Gestes Climat',
            publisher: { '@id': ADEME_ORGANIZATION_ID },
          },
          {
            '@type': 'GovernmentOrganization',
            '@id': ADEME_ORGANIZATION_ID,
            name: 'ADEME',
            url: 'https://www.ademe.fr/',
            description: 'Agence de la transition écologique',
          },
          {
            '@type': 'Guide',
            '@id': actionUrl,
            url: actionUrl,
            name,
            description,
            inLanguage,
            publisher: { '@id': ADEME_ORGANIZATION_ID },
            isPartOf: { '@id': pageId },
          },
        ],
      },
    ]
  }

  const hasGraph = Array.isArray(storedJsonLd['@graph'])
  const nodes = hasGraph
    ? (storedJsonLd['@graph'] as unknown[])
        .map(asNode)
        .filter((node): node is JsonLdNode => node !== null)
    : [storedJsonLd]

  if (nodes.length === 0) {
    return []
  }

  const patchedNodes = nodes.map((node): JsonLdNode => {
    const normalizedNode = normalizeUrls(node) as JsonLdNode

    if (hasType(normalizedNode, 'CollectionPage')) {
      return {
        ...normalizedNode,
        '@id': pageId,
        url: actionUrl,
        inLanguage,
        isPartOf: { '@id': websiteId },
        breadcrumb: { '@id': breadcrumbId },
        hasPart: { '@id': actionUrl },
      }
    }

    if (hasType(normalizedNode, 'BreadcrumbList')) {
      return {
        ...normalizedNode,
        '@id': breadcrumbId,
        itemListElement: buildBreadcrumbItems(
          normalizedNode,
          breadcrumbOptions
        ),
      }
    }

    if (hasType(normalizedNode, 'WebSite')) {
      return {
        ...normalizedNode,
        '@id': websiteId,
        url: homeUrl,
      }
    }

    if (hasType(normalizedNode, 'Guide')) {
      return {
        ...normalizedNode,
        '@id': actionUrl,
        url: actionUrl,
        inLanguage,
        isPartOf: { '@id': pageId },
      }
    }

    return normalizedNode
  })

  return hasGraph
    ? [
        {
          ...storedJsonLd,
          '@graph': patchedNodes,
        },
      ]
    : patchedNodes
}

function buildBreadcrumbItems(
  node: JsonLdNode,
  {
    actionTitle,
    actionUrl,
    actionsUrl,
    homeUrl,
    locale,
  }: {
    actionTitle: string
    actionUrl: string
    actionsUrl: string
    homeUrl: string
    locale: Locale
  }
) {
  const storedItems = Array.isArray(node.itemListElement)
    ? node.itemListElement
        .map(asNode)
        .filter((item): item is JsonLdNode => item !== null)
    : []

  const labels = BREADCRUMB_LABELS[locale]
  const homeName =
    typeof storedItems[0]?.name === 'string' ? storedItems[0].name : labels.home
  const actionsName =
    typeof storedItems[1]?.name === 'string'
      ? storedItems[1].name
      : labels.actions

  return [
    {
      '@type': 'ListItem',
      position: 1,
      name: homeName,
      item: homeUrl,
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: actionsName,
      item: actionsUrl,
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: actionTitle,
      item: actionUrl,
    },
  ]
}

function normalizeUrls(value: unknown, key?: string): unknown {
  if (typeof value === 'string') {
    return key && URL_KEYS.has(key) ? unwrapMarkdownLink(value) : value
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeUrls(item, key))
  }

  const node = asNode(value)
  if (!node) {
    return value
  }

  return Object.fromEntries(
    Object.entries(node).map(([childKey, child]) => [
      childKey,
      normalizeUrls(child, childKey),
    ])
  )
}

/** Notion turns bare URLs into Markdown links, including inside stored JSON-LD. */
function unwrapMarkdownLink(value: string) {
  const match = /^\[[^\]]*\]\(([^)]+)\)$/.exec(value)
  return match ? match[1] : value
}

function hasType(node: JsonLdNode, type: string) {
  return getType(node).includes(type)
}

function getType(node: JsonLdNode): unknown[] {
  const type = node['@type']
  return Array.isArray(type) ? (type as unknown[]) : [type]
}

function asNode(value: unknown): JsonLdNode | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as JsonLdNode)
    : null
}
