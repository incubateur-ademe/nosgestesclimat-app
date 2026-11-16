import { ACTION_DETAIL_PATH, ACTIONS_PATH } from '@/constants/urls/paths'
import { getLocalizedPath } from '@/helpers/language/getLocalizedPath'
import { getSiteUrl } from '@/helpers/metadata/getSiteUrl'
import type { Locale } from '@/i18nConfig'
import type { Action } from '@nosgestesclimat/core/features/actions/types/action'

type JsonLdNode = Record<string, unknown>

const SCHEMA_CONTEXT = 'https://schema.org'
const SITE_NAME = 'Nos Gestes Climat'
const ADEME_ORGANIZATION_ID = 'https://www.ademe.fr/#organization'

/** Keys whose values are URLs: Notion turns bare URLs into Markdown links,
 * including inside the JSON-LD it stores. */
const URL_KEYS = new Set([
  '@context',
  '@id',
  'url',
  'item',
  'sameAs',
  'contentUrl',
  'embedUrl',
])

const BREADCRUMB_LABELS = {
  fr: { home: 'Accueil', actions: 'Actions' },
  en: { home: 'Home', actions: 'Actions' },
}

/**
 * Builds the JSON-LD documents of an action detail page.
 *
 * The stored JSON-LD comes from the actions catalogue template: it describes a
 * collection rooted at the home page. Slugs, locale and every URL owned by the
 * page are therefore regenerated from the action itself rather than trusted
 * from the CMS.
 */
export function buildActionDetailJsonLd(
  action: Action,
  locale: Locale
): JsonLdNode[] {
  const siteUrl = getSiteUrl()
  const actionUrl = `${siteUrl}${getLocalizedPath(
    locale,
    ACTION_DETAIL_PATH(action.theme.slug, action.slug)
  )}`
  const actionsUrl = `${siteUrl}${getLocalizedPath(locale, ACTIONS_PATH)}`
  const homeUrl = `${siteUrl}/`
  const websiteId = `${siteUrl}/#website`
  const pageId = `${actionUrl}#webpage`
  const breadcrumbId = `${actionUrl}#breadcrumb`

  const name = action.metadata.title ?? action.title
  const description =
    action.metadata.description ?? action.description ?? action.longDescription
  const image = resolveImage(action, siteUrl)
  const datePublished = action.publishedAt?.toISOString()

  const breadcrumbItems = buildBreadcrumbItems({
    actionTitle: action.title,
    actionUrl,
    actionsUrl,
    homeUrl,
    locale,
  })

  const pageNode = (base: JsonLdNode = {}): JsonLdNode =>
    patchNode(
      base,
      {
        // A detail page is not a collection: `CollectionPage` comes from the
        // catalogue template and would describe the wrong thing here.
        '@type': hasType(base, 'CollectionPage')
          ? 'WebPage'
          : (base['@type'] ?? 'WebPage'),
        '@id': pageId,
        url: actionUrl,
        name,
        description,
        inLanguage: locale,
        isPartOf: { '@id': websiteId },
        about: { '@id': ADEME_ORGANIZATION_ID },
        isAccessibleForFree: true,
        breadcrumb: { '@id': breadcrumbId },
        ...(datePublished ? { datePublished } : {}),
        ...(image ? { image } : {}),
      },
      // The page itself has no parts: the stored `hasPart` points to the
      // catalogue entry, i.e. to the page, so it is dropped.
      ['hasPart']
    )

  const entityNode = (base: JsonLdNode = {}): JsonLdNode =>
    patchNode(base, {
      '@type': base['@type'] ?? 'Guide',
      '@id': actionUrl,
      url: actionUrl,
      name,
      description,
      inLanguage: locale,
      publisher: { '@id': ADEME_ORGANIZATION_ID },
      isPartOf: { '@id': pageId },
      ...(datePublished ? { datePublished } : {}),
      ...(image ? { image } : {}),
    })

  const breadcrumbNode = (base: JsonLdNode = {}): JsonLdNode =>
    patchNode(base, {
      '@type': base['@type'] ?? 'BreadcrumbList',
      '@id': breadcrumbId,
      itemListElement: breadcrumbItems,
    })

  const websiteNode = (base: JsonLdNode = {}): JsonLdNode =>
    patchNode(base, {
      '@type': base['@type'] ?? 'WebSite',
      '@id': websiteId,
      url: homeUrl,
    })

  const organizationNode = (base: JsonLdNode = {}): JsonLdNode =>
    patchNode(
      {
        name: 'ADEME',
        url: 'https://www.ademe.fr/',
        description: 'Agence de la transition écologique',
        ...base,
      },
      {
        '@type': 'GovernmentOrganization',
        '@id': ADEME_ORGANIZATION_ID,
      }
    )

  const stored = readStoredJsonLd(action.metadata.jsonLd)

  if (!stored) {
    return [
      {
        '@context': SCHEMA_CONTEXT,
        '@graph': [
          pageNode(),
          breadcrumbNode(),
          websiteNode({ name: SITE_NAME }),
          organizationNode(),
          entityNode(),
        ],
      },
    ]
  }

  let hasPageNode = false

  const nodes = stored.nodes.map((node): JsonLdNode => {
    if (hasType(node, 'BreadcrumbList')) return breadcrumbNode(node)
    if (hasType(node, 'WebSite')) return websiteNode(node)
    if (hasType(node, 'Guide')) return entityNode(node)
    if (
      hasType(node, 'GovernmentOrganization') ||
      node['@id'] === ADEME_ORGANIZATION_ID
    )
      return organizationNode(node)

    if (!hasPageNode) {
      hasPageNode = true
      return pageNode(node)
    }

    return withLocale(node, locale)
  })

  // Every reference the page emits must resolve inside the same document,
  // otherwise the graph points at entities that do not exist.
  ensureNode(nodes, pageId, () => pageNode())
  ensureNode(nodes, breadcrumbId, () => breadcrumbNode())
  ensureNode(nodes, websiteId, () => websiteNode({ name: SITE_NAME }))
  ensureNode(nodes, ADEME_ORGANIZATION_ID, () => organizationNode())
  ensureNode(nodes, actionUrl, () => entityNode())

  return [
    {
      ...(normalizeUrls(stored.topLevel) as JsonLdNode),
      '@context': SCHEMA_CONTEXT,
      '@graph': nodes,
    },
  ]
}

function buildBreadcrumbItems({
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
}) {
  const labels = BREADCRUMB_LABELS[locale]

  return [
    {
      '@type': 'ListItem',
      position: 1,
      name: labels.home,
      item: homeUrl,
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: labels.actions,
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

/** Splits a stored JSON-LD value into the nodes to rebuild and the remaining
 * top-level keys. Returns `null` when nothing usable is stored, so that the
 * generated fallback is used instead of an empty document. */
function readStoredJsonLd(
  jsonLd: unknown
): { topLevel: JsonLdNode; nodes: JsonLdNode[] } | null {
  if (Array.isArray(jsonLd)) {
    const nodes = toNodes(jsonLd)
    return nodes.length > 0 ? { topLevel: {}, nodes } : null
  }

  const document = asNode(jsonLd)
  if (!document) return null

  const graph = document['@graph']
  if (Array.isArray(graph)) {
    const nodes = toNodes(graph)
    if (nodes.length === 0) return null

    return { topLevel: omitGraph(document), nodes }
  }

  return { topLevel: {}, nodes: [document] }
}

function toNodes(value: unknown[]) {
  return value
    .map((item) => asNode(normalizeUrls(item)))
    .filter((item): item is JsonLdNode => item !== null)
}

function ensureNode(nodes: JsonLdNode[], id: string, create: () => JsonLdNode) {
  if (!nodes.some((node) => node['@id'] === id)) {
    nodes.push(create())
  }
}

/** Applies the page-owned values, then drops the fields the page must not
 * inherit from the stored document. */
function patchNode(
  base: JsonLdNode,
  overrides: JsonLdNode,
  droppedKeys: string[] = []
): JsonLdNode {
  const node: JsonLdNode = { ...base, ...overrides }

  for (const key of droppedKeys) {
    delete node[key]
  }

  return node
}

/** Overrides `inLanguage` when the node states one: the document is served for
 * a single locale, so a value carried over from another one cannot stay. */
function withLocale(node: JsonLdNode, locale: Locale): JsonLdNode {
  return 'inLanguage' in node ? { ...node, inLanguage: locale } : node
}

function omitGraph(document: JsonLdNode): JsonLdNode {
  return Object.fromEntries(
    Object.entries(document).filter(([key]) => key !== '@graph')
  )
}

function resolveImage(action: Action, siteUrl: string) {
  if (action.media?.type !== 'image') return undefined

  const { src } = action.media
  if (/^https?:\/\//.test(src)) return src

  return `${siteUrl}${src.startsWith('/') ? src : `/${src}`}`
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
