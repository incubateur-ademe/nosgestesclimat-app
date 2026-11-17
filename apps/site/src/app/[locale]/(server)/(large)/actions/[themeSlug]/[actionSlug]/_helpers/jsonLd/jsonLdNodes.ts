import type { ActionJsonLdContext } from './buildActionJsonLdContext'
import {
  ADEME_ORGANIZATION_ID,
  hasType,
  type JsonLdNode,
  patchNode,
} from './jsonLdUtils'

const BREADCRUMB_LABELS = {
  fr: { home: 'Accueil', actions: 'Actions' },
  en: { home: 'Home', actions: 'Actions' },
}

export const buildPageNode = (
  context: ActionJsonLdContext,
  base: JsonLdNode = {}
): JsonLdNode =>
  patchNode(
    base,
    {
      // A detail page is not a collection: `CollectionPage` comes from the
      // catalogue template and would describe the wrong thing here.
      '@type': hasType(base, 'CollectionPage')
        ? 'WebPage'
        : (base['@type'] ?? 'WebPage'),
      '@id': context.pageId,
      url: context.actionUrl,
      name: context.name,
      description: context.description,
      inLanguage: context.locale,
      isPartOf: { '@id': context.websiteId },
      about: { '@id': ADEME_ORGANIZATION_ID },
      isAccessibleForFree: true,
      breadcrumb: { '@id': context.breadcrumbId },
      ...(context.datePublished
        ? { datePublished: context.datePublished }
        : {}),
      ...(context.image ? { image: context.image } : {}),
    },
    // The page itself has no parts: the stored `hasPart` points to the
    // catalogue entry, i.e. to the page, so it is dropped.
    ['hasPart']
  )

export const buildEntityNode = (
  context: ActionJsonLdContext,
  base: JsonLdNode = {}
): JsonLdNode =>
  patchNode(base, {
    '@type': base['@type'] ?? 'Guide',
    '@id': context.actionUrl,
    url: context.actionUrl,
    name: context.name,
    description: context.description,
    inLanguage: context.locale,
    publisher: { '@id': ADEME_ORGANIZATION_ID },
    isPartOf: { '@id': context.pageId },
    ...(context.datePublished ? { datePublished: context.datePublished } : {}),
    ...(context.image ? { image: context.image } : {}),
  })

export const buildBreadcrumbNode = (
  context: ActionJsonLdContext,
  base: JsonLdNode = {}
): JsonLdNode =>
  patchNode(base, {
    '@type': base['@type'] ?? 'BreadcrumbList',
    '@id': context.breadcrumbId,
    itemListElement: buildBreadcrumbItems(context),
  })

export const buildWebsiteNode = (
  context: ActionJsonLdContext,
  base: JsonLdNode = {}
): JsonLdNode =>
  patchNode(base, {
    '@type': base['@type'] ?? 'WebSite',
    '@id': context.websiteId,
    url: context.homeUrl,
  })

export const buildOrganizationNode = (base: JsonLdNode = {}): JsonLdNode =>
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

const buildBreadcrumbItems = (context: ActionJsonLdContext) => {
  const labels = BREADCRUMB_LABELS[context.locale]

  return [
    {
      '@type': 'ListItem',
      position: 1,
      name: labels.home,
      item: context.homeUrl,
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: labels.actions,
      item: context.actionsUrl,
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: context.actionTitle,
      item: context.actionUrl,
    },
  ]
}
