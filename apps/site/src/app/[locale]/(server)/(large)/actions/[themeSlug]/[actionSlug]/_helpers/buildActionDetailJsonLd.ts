import type { Locale } from '@/i18nConfig'
import type { Action } from '@nosgestesclimat/core/features/actions/types/action'
import type { JsonLdDocument } from '@nosgestesclimat/core/features/actions/types/seo-metadata'
import {
  buildActionJsonLdContext,
  type ActionJsonLdContext,
} from './jsonLd/buildActionJsonLdContext'
import {
  buildBreadcrumbNode,
  buildEntityNode,
  buildOrganizationNode,
  buildPageNode,
  buildWebsiteNode,
} from './jsonLd/jsonLdNodes'
import {
  ADEME_ORGANIZATION_ID,
  ensureNode,
  SCHEMA_CONTEXT,
  SITE_NAME,
} from './jsonLd/jsonLdUtils'
import { readStoredJsonLd, rebuildStoredNodes } from './jsonLd/storedJsonLd'

/**
 * Builds the JSON-LD document of an action detail page.
 *
 * The stored document is authored from a template rooted at the home page: it
 * is rebuilt so that it describes the current action and locale. When nothing
 * is stored, the document is generated from the action data.
 */
export function buildActionDetailJsonLd(
  action: Action,
  locale: Locale
): JsonLdDocument[] {
  const context = buildActionJsonLdContext(action, locale)
  const storedNodes = readStoredJsonLd(action.metadata.jsonLd)

  const nodes = storedNodes
    ? rebuildStoredNodes(storedNodes, context)
    : buildGeneratedNodes(context)

  // Every reference the page emits must resolve inside the same document,
  // otherwise the graph points at entities that do not exist.
  ensureNode(nodes, context.pageId, () => buildPageNode(context))
  ensureNode(nodes, context.breadcrumbId, () => buildBreadcrumbNode(context))
  ensureNode(nodes, context.websiteId, () => buildWebsiteNode(context))
  ensureNode(nodes, ADEME_ORGANIZATION_ID, () => buildOrganizationNode())
  ensureNode(nodes, context.actionUrl, () => buildEntityNode(context))

  return [{ '@context': SCHEMA_CONTEXT, '@graph': nodes }]
}

const buildGeneratedNodes = (context: ActionJsonLdContext) => [
  buildPageNode(context),
  buildBreadcrumbNode(context),
  buildWebsiteNode(context, { name: SITE_NAME }),
  buildOrganizationNode(),
  buildEntityNode(context),
]
