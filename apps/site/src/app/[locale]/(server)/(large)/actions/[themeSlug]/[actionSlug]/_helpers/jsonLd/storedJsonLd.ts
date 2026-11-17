import type { JsonLdDocument } from '@nosgestesclimat/core/features/actions/types/seo-metadata'
import type { ActionJsonLdContext } from './buildActionJsonLdContext'
import {
  buildBreadcrumbNode,
  buildEntityNode,
  buildOrganizationNode,
  buildPageNode,
  buildWebsiteNode,
} from './jsonLdNodes'
import {
  ADEME_ORGANIZATION_ID,
  asNode,
  hasType,
  type JsonLdNode,
  withLocale,
} from './jsonLdUtils'

/**
 * Nodes of the JSON-LD document stored for the action, or `null` when it holds
 * nothing to rebuild. The sync script stores the document as a `@graph` list.
 */
export function readStoredJsonLd(
  jsonLd: JsonLdDocument | null | undefined
): JsonLdNode[] | null {
  if (!jsonLd) return null

  const nodes = jsonLd['@graph']
    .map(asNode)
    .filter((node): node is JsonLdNode => node !== null)

  return nodes.length > 0 ? nodes : null
}

/** Rebuilds the stored nodes with the values owned by the page: the stored
 * document is authored from a site-level template (its page and breadcrumb
 * nodes point at the home page), so slugs, locale and every URL of the page
 * are regenerated from the action itself. */
export function rebuildStoredNodes(
  nodes: JsonLdNode[],
  context: ActionJsonLdContext
): JsonLdNode[] {
  const pageIndex = findPageNodeIndex(nodes)

  return nodes.map((node, index) => {
    if (hasType(node, 'BreadcrumbList'))
      return buildBreadcrumbNode(context, node)
    if (hasType(node, 'WebSite')) return buildWebsiteNode(context, node)
    if (hasType(node, 'Guide')) return buildEntityNode(context, node)
    if (isOrganization(node)) return buildOrganizationNode(node)
    if (index === pageIndex) return buildPageNode(context, node)

    return withLocale(node, context.locale)
  })
}

const isOrganization = (node: JsonLdNode) =>
  hasType(node, 'GovernmentOrganization') ||
  node['@id'] === ADEME_ORGANIZATION_ID

const isSupportingNode = (node: JsonLdNode) =>
  hasType(node, 'BreadcrumbList') ||
  hasType(node, 'WebSite') ||
  hasType(node, 'Guide') ||
  isOrganization(node)

/** The first node that is not one of the supporting entities is the page node
 * inherited from the site-level template. */
const findPageNodeIndex = (nodes: JsonLdNode[]) =>
  nodes.findIndex((node) => !isSupportingNode(node))
