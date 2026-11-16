import { getSiteUrl } from '@/helpers/metadata/getSiteUrl'
import type { Action } from '@nosgestesclimat/core/features/actions/types/action'
import { describe, expect, it } from 'vitest'
import { buildActionDetailJsonLd } from '../buildActionDetailJsonLd'

const SITE_URL = getSiteUrl()

const ACTION_URL = `${SITE_URL}/actions/transport/limiter-avion-toutes-distances`

type Node = Record<string, unknown>

/**
 * Verbatim copy of the JSON-LD stored in the actions catalogue Notion database
 * (see NGC-3570): the context is Markdown-wrapped, the breadcrumb is
 * misspelled, it trails an invalid entry, and every URL points at the
 * catalogue.
 */
const storedCatalogueJsonLd = {
  '@context': 'https://schema.org](https://schema.org/)',
  '@graph': [
    {
      '@type': 'CollectionPage',
      '@id': 'https://nosgestesclimat.fr/#webpage',
      url: 'https://nosgestesclimat.fr/',
      name: 'Actions de réduction CO2',
      description:
        "Catalogue d'actions pour réduire son empreinte carbone et prendre soin de soi",
      inLanguage: 'fr-FR',
      isPartOf: { '@id': 'https://nosgestesclimat.fr/#website' },
      about: { '@id': 'https://www.ademe.fr/#organization' },
      isAccessibleForFree: true,
      breadcrumb: { '@id': 'https://nosgestesclimat.fr/#breadcrumb' },
    },
    {
      '@type': 'BreadcrumbList',
      '@id': 'https://nosgestesclimat.fr/#breadcrumb',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Accueil',
          item: 'https://nosgestesclimat.fr/',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Actionstbcur',
          item: 'https://nosgestesclimat.fr/',
        },
      ],
    },
    {
      '@type': 'WebSite',
      '@id': 'https://nosgestesclimat.fr/#website',
      url: 'https://nosgestesclimat.fr/',
      name: 'Nos Gestes Climat',
      publisher: { '@id': 'https://www.ademe.fr/#organization' },
    },
    {
      '@type': 'GovernmentOrganization',
      '@id':
        '[https://www.ademe.fr/#organization](https://www.ademe.fr/#organization)',
      name: 'ADEME',
      url: '[https://www.ademe.fr/](https://www.ademe.fr/)',
      description: 'Agence de la transition écologique',
    },
    '###',
  ],
}

const action = {
  id: 'action-id',
  title: 'Limiter l’avion sur toutes les distances',
  slug: 'limiter-avion-toutes-distances',
  trackingId: 'transport-limiter-avion',
  language: 'fr',
  longDescription: 'Description longue',
  theme: {
    id: 'theme-id',
    key: 'transport',
    slug: 'transport',
    trackingId: 'transport',
    title: 'Transport',
    emoji: '🚆',
  },
  ruleId: 'transport . avion',
  metadata: {},
  publishedAt: null,
  deletedAt: null,
} satisfies Action

const withStoredJsonLd = (jsonLd: unknown): Action => ({
  ...action,
  metadata: { jsonLd },
})

const buildGraph = (a: Action = action, locale: 'fr' | 'en' = 'fr') =>
  buildActionDetailJsonLd(a, locale)[0]['@graph'] as Node[]

const findNode = (graph: Node[], type: string) =>
  graph.find((node) => node['@type'] === type)

const findNodes = (graph: Node[], type: string) =>
  graph.filter((node) => node['@type'] === type)

/** Every `{ '@id': … }` reference of the document, wherever it sits. */
const collectReferences = (value: unknown, references: string[] = []) => {
  if (Array.isArray(value)) {
    value.forEach((item) => collectReferences(item, references))
    return references
  }

  if (typeof value !== 'object' || value === null) return references

  const entries = Object.entries(value)
  if (entries.length === 1 && entries[0][0] === '@id') {
    references.push(String(entries[0][1]))
    return references
  }

  entries.forEach(([, child]) => collectReferences(child, references))
  return references
}

const collectIds = (graph: Node[]) =>
  graph.map((node) => node['@id']).filter((id): id is string => Boolean(id))

describe('buildActionDetailJsonLd', () => {
  describe('with a stored JSON-LD copied from the actions catalogue', () => {
    it('restores a valid @context', () => {
      const [document] = buildActionDetailJsonLd(
        withStoredJsonLd(storedCatalogueJsonLd),
        'fr'
      )

      expect(document['@context']).toBe('https://schema.org')
    })

    it('describes a page, not a collection, and rebuilds the URLs from the action slugs', () => {
      const graph = buildGraph(withStoredJsonLd(storedCatalogueJsonLd))
      const page = findNode(graph, 'WebPage')

      expect(page).toEqual(
        expect.objectContaining({
          '@id': `${ACTION_URL}#webpage`,
          url: ACTION_URL,
          name: action.title,
          description: action.longDescription,
          inLanguage: 'fr',
        })
      )
      expect(page).not.toHaveProperty('hasPart')
      expect(findNode(graph, 'CollectionPage')).toBeUndefined()
    })

    it('exposes the action itself as the entity of the page', () => {
      const graph = buildGraph(withStoredJsonLd(storedCatalogueJsonLd))

      expect(findNode(graph, 'Guide')).toEqual(
        expect.objectContaining({
          '@id': ACTION_URL,
          url: ACTION_URL,
          name: action.title,
          isPartOf: { '@id': `${ACTION_URL}#webpage` },
        })
      )
    })

    it('rebuilds the breadcrumb from localized labels instead of the stored ones', () => {
      const graph = buildGraph(withStoredJsonLd(storedCatalogueJsonLd))
      const breadcrumb = findNode(graph, 'BreadcrumbList')

      expect(breadcrumb).toEqual(
        expect.objectContaining({
          '@id': `${ACTION_URL}#breadcrumb`,
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Accueil',
              item: `${SITE_URL}/`,
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'Actions',
              item: `${SITE_URL}/actions`,
            },
            {
              '@type': 'ListItem',
              position: 3,
              name: action.title,
              item: ACTION_URL,
            },
          ],
        })
      )
      expect(JSON.stringify(graph)).not.toContain('Actionstbcur')
    })

    it('localizes URLs, language and breadcrumb labels', () => {
      const graph = buildGraph(withStoredJsonLd(storedCatalogueJsonLd), 'en')
      const englishActionUrl = `${SITE_URL}/en/actions/transport/limiter-avion-toutes-distances`

      expect(findNode(graph, 'WebPage')).toEqual(
        expect.objectContaining({ '@id': `${englishActionUrl}#webpage` })
      )
      expect(findNode(graph, 'Guide')).toEqual(
        expect.objectContaining({
          '@id': englishActionUrl,
          inLanguage: 'en',
        })
      )
      expect(
        (findNode(graph, 'BreadcrumbList')?.itemListElement as Node[]).map(
          (item) => item.name
        )
      ).toEqual(['Home', 'Actions', action.title])
    })

    it('unwraps the Markdown links Notion writes around URLs', () => {
      const graph = buildGraph(withStoredJsonLd(storedCatalogueJsonLd))
      const organization = findNode(graph, 'GovernmentOrganization')

      expect(organization).toEqual(
        expect.objectContaining({
          '@id': 'https://www.ademe.fr/#organization',
          url: 'https://www.ademe.fr/',
        })
      )
      expect(findNode(graph, 'WebSite')?.publisher).toEqual({
        '@id': 'https://www.ademe.fr/#organization',
      })
      expect(JSON.stringify(graph)).not.toContain('](')
    })

    it('drops the entries that are not nodes', () => {
      const graph = buildGraph(withStoredJsonLd(storedCatalogueJsonLd))

      expect(graph.every((node) => typeof node === 'object')).toBe(true)
      expect(graph).toHaveLength(5)
    })

    it('only emits references that resolve inside the document', () => {
      const graph = buildGraph(withStoredJsonLd(storedCatalogueJsonLd))
      const ids = collectIds(graph)

      expect(
        collectReferences(graph).filter((id) => !ids.includes(id))
      ).toEqual([])
    })
  })

  describe('with a partial stored JSON-LD', () => {
    const partial = {
      '@graph': [
        {
          '@type': 'Guide',
          '@id': 'https://nosgestesclimat.fr/',
          name: 'Guide',
        },
      ],
    }

    it('adds the nodes the page references', () => {
      const graph = buildGraph(withStoredJsonLd(partial))
      const ids = collectIds(graph)

      expect(ids).toEqual(
        expect.arrayContaining([
          `${ACTION_URL}#webpage`,
          `${ACTION_URL}#breadcrumb`,
          `${SITE_URL}/#website`,
          'https://www.ademe.fr/#organization',
          ACTION_URL,
        ])
      )
      expect(
        collectReferences(graph).filter((id) => !ids.includes(id))
      ).toEqual([])
    })

    it('rewrites the URLs of a node whose type it does not know', () => {
      const graph = buildGraph(
        withStoredJsonLd({
          '@graph': [
            { '@type': 'Article', '@id': `${SITE_URL}/`, url: `${SITE_URL}/` },
          ],
        })
      )

      expect(findNode(graph, 'Article')).toEqual(
        expect.objectContaining({
          '@id': `${ACTION_URL}#webpage`,
          url: ACTION_URL,
        })
      )
    })

    it('keeps the types the CMS declares beyond the one used to recognise the node', () => {
      const graph = buildGraph(
        withStoredJsonLd({
          '@graph': [{ '@type': ['Guide', 'HowTo'], '@id': `${SITE_URL}/` }],
        })
      )

      expect(
        graph.find((node) => node['@id'] === ACTION_URL)?.['@type']
      ).toEqual(['Guide', 'HowTo'])
    })

    it('accepts a document given as a top-level array', () => {
      const graph = buildGraph(
        withStoredJsonLd([
          { '@type': 'WebPage', '@id': `${SITE_URL}/`, url: `${SITE_URL}/` },
        ])
      )

      expect(findNode(graph, 'WebPage')).toEqual(
        expect.objectContaining({ url: ACTION_URL })
      )
    })
  })

  describe('with a stored but empty JSON-LD', () => {
    it('falls back to the generated document', () => {
      const documents = buildActionDetailJsonLd(
        withStoredJsonLd({ '@context': 'https://schema.org', '@graph': [] }),
        'fr'
      )

      expect(documents).toHaveLength(1)
      expect(
        findNode(buildGraph(withStoredJsonLd({ '@graph': [] })), 'WebPage')
      ).toEqual(expect.objectContaining({ '@id': `${ACTION_URL}#webpage` }))
    })
  })

  describe('without any stored JSON-LD', () => {
    it('builds the document from the action data', () => {
      const graph = buildGraph()

      expect(findNode(graph, 'WebPage')).toEqual(
        expect.objectContaining({
          '@id': `${ACTION_URL}#webpage`,
          url: ACTION_URL,
          name: action.title,
          description: action.longDescription,
        })
      )
      expect(findNode(graph, 'Guide')).toEqual(
        expect.objectContaining({ '@id': ACTION_URL, name: action.title })
      )
      expect(findNode(graph, 'WebSite')).toEqual(
        expect.objectContaining({ name: 'Nos Gestes Climat' })
      )
      expect(findNode(graph, 'GovernmentOrganization')).toEqual(
        expect.objectContaining({ '@id': 'https://www.ademe.fr/#organization' })
      )
    })

    it('prefers the metadata title and description', () => {
      const graph = buildGraph({
        ...action,
        description: 'Accroche',
        metadata: { title: 'Titre SEO', description: 'Description SEO' },
      })

      expect(findNode(graph, 'WebPage')).toEqual(
        expect.objectContaining({
          name: 'Titre SEO',
          description: 'Description SEO',
        })
      )
    })

    it('falls back to the description then to the long description', () => {
      const graph = buildGraph({ ...action, description: 'Accroche' })

      expect(findNode(graph, 'WebPage')?.description).toBe('Accroche')
    })

    it('exposes the publication date and the illustration', () => {
      const graph = buildGraph({
        ...action,
        publishedAt: new Date('2026-01-05T10:00:00.000Z'),
        media: {
          type: 'image',
          title: 'Illustration',
          alt: 'Avion',
          src: '/images/avion.png',
        },
      })

      expect(findNode(graph, 'WebPage')).toEqual(
        expect.objectContaining({
          datePublished: '2026-01-05T10:00:00.000Z',
          image: `${SITE_URL}/images/avion.png`,
        })
      )
    })

    it('builds a single page node, not one per type', () => {
      const graph = buildGraph()

      expect(findNodes(graph, 'WebPage')).toHaveLength(1)
      expect(findNodes(graph, 'Guide')).toHaveLength(1)
      expect(findNodes(graph, 'BreadcrumbList')).toHaveLength(1)
    })
  })
})
