import type { Action } from '@nosgestesclimat/core/features/actions/types/action'
import { describe, expect, it } from 'vitest'
import { buildActionDetailJsonLd } from '../buildActionDetailJsonLd'

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
  metadata: {
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'CollectionPage',
          '@id':
            '[https://nosgestesclimat.fr/#webpage](https://nosgestesclimat.fr/#webpage)',
          url: 'https://nosgestesclimat.fr/',
          name: 'Limiter l’avion',
          description: 'Description de la page',
          inLanguage: 'fr-FR',
          isPartOf: { '@id': 'https://nosgestesclimat.fr/#website' },
          about: {
            '@id':
              '[https://www.ademe.fr/#organization](https://www.ademe.fr/#organization)',
          },
          breadcrumb: {
            '@id':
              '[https://nosgestesclimat.fr/#breadcrumb](https://nosgestesclimat.fr/#breadcrumb)',
          },
          hasPart: {
            '@id': 'https://nosgestesclimat.fr/transport/limiter-avion',
          },
        },
        {
          '@type': 'BreadcrumbList',
          '@id':
            '[https://nosgestesclimat.fr/#breadcrumb](https://nosgestesclimat.fr/#breadcrumb)',
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
              name: 'Actions',
              item: 'https://nosgestesclimat.fr/',
            },
            {
              '@type': 'ListItem',
              position: 3,
              name: 'Transport',
              item: 'https://nosgestesclimat.fr/transport',
            },
          ],
        },
        {
          '@type': 'WebSite',
          '@id': 'https://nosgestesclimat.fr/#website',
          url: 'https://nosgestesclimat.fr/',
          name: 'Nos Gestes Climat',
          publisher: {
            '@id':
              '[https://www.ademe.fr/#organization](https://www.ademe.fr/#organization)',
          },
        },
        {
          '@type': 'GovernmentOrganization',
          '@id':
            '[https://www.ademe.fr/#organization](https://www.ademe.fr/#organization)',
          name: 'ADEME',
          url: '[https://www.ademe.fr/](https://www.ademe.fr/)',
        },
        {
          '@type': 'Guide',
          '@id': 'https://nosgestesclimat.fr/transport/limiter-avion',
          url: 'https://nosgestesclimat.fr/transport/limiter-avion',
          name: 'Limiter l’avion',
          inLanguage: 'fr-FR',
          isPartOf: {
            '@id':
              '[https://nosgestesclimat.fr/#webpage](https://nosgestesclimat.fr/#webpage)',
          },
        },
      ],
    },
  },
  publishedAt: null,
  deletedAt: null,
} satisfies Action

const getGraph = (locale: 'fr' | 'en') => {
  const [jsonLd] = buildActionDetailJsonLd(action, locale)
  return jsonLd['@graph'] as Record<string, unknown>[]
}

describe('buildActionDetailJsonLd', () => {
  it('regenerates action URLs from the current slugs and locale', () => {
    const graph = getGraph('fr')
    const actionUrl =
      'http://localhost:3000/actions/transport/limiter-avion-toutes-distances'

    expect(graph).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          '@type': 'CollectionPage',
          '@id': `${actionUrl}#webpage`,
          url: actionUrl,
          hasPart: { '@id': actionUrl },
        }),
        expect.objectContaining({
          '@type': 'Guide',
          '@id': actionUrl,
          url: actionUrl,
          isPartOf: { '@id': `${actionUrl}#webpage` },
        }),
      ])
    )
  })

  it('regenerates breadcrumb URLs and uses the action title for the last item', () => {
    const graph = getGraph('fr')
    const actionUrl =
      'http://localhost:3000/actions/transport/limiter-avion-toutes-distances'
    const breadcrumb = graph.find((node) => node['@type'] === 'BreadcrumbList')

    expect(breadcrumb).toEqual(
      expect.objectContaining({
        '@id': `${actionUrl}#breadcrumb`,
        itemListElement: [
          expect.objectContaining({
            name: 'Accueil',
            item: 'http://localhost:3000/',
          }),
          expect.objectContaining({
            name: 'Actions',
            item: 'http://localhost:3000/actions',
          }),
          expect.objectContaining({
            name: action.title,
            item: actionUrl,
          }),
        ],
      })
    )
  })

  it('localizes URLs and language', () => {
    const graph = getGraph('en')
    const actionUrl =
      'http://localhost:3000/en/actions/transport/limiter-avion-toutes-distances'

    expect(graph).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          '@type': 'Guide',
          '@id': actionUrl,
          inLanguage: 'en-GB',
        }),
      ])
    )
  })

  it('removes Notion Markdown links around external URLs', () => {
    const graph = getGraph('fr')

    expect(graph).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          '@type': 'GovernmentOrganization',
          '@id': 'https://www.ademe.fr/#organization',
          url: 'https://www.ademe.fr/',
        }),
        expect.objectContaining({
          '@type': 'WebSite',
          publisher: { '@id': 'https://www.ademe.fr/#organization' },
        }),
      ])
    )
  })

  it('builds JSON-LD from the action data when none is stored', () => {
    const graph = buildActionDetailJsonLd({ ...action, metadata: {} }, 'fr')[0][
      '@graph'
    ] as Record<string, unknown>[]
    const actionUrl =
      'http://localhost:3000/actions/transport/limiter-avion-toutes-distances'

    expect(graph).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          '@type': 'CollectionPage',
          '@id': `${actionUrl}#webpage`,
          url: actionUrl,
          name: action.title,
        }),
        expect.objectContaining({
          '@type': 'Guide',
          '@id': actionUrl,
          url: actionUrl,
          name: action.title,
        }),
      ])
    )
  })

  it('localizes the default breadcrumb labels', () => {
    const graph = buildActionDetailJsonLd({ ...action, metadata: {} }, 'en')[0][
      '@graph'
    ] as Record<string, unknown>[]
    const breadcrumb = graph.find((node) => node['@type'] === 'BreadcrumbList')

    expect(breadcrumb).toEqual(
      expect.objectContaining({
        itemListElement: [
          expect.objectContaining({ name: 'Home' }),
          expect.objectContaining({ name: 'Actions' }),
          expect.objectContaining({ name: action.title }),
        ],
      })
    )
  })
})
