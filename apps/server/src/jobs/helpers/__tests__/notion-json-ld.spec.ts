import { describe, expect, it } from 'vitest'
import { cleanJsonLd } from '../notion-json-ld.ts'

/** Document as read from Notion: `seo_json_ld` is a rich text property, so
 * `convertNotionRichTextToMd` wraps every link it holds in a Markdown link
 * (here the `@context` and the organization URLs), and the Markdown the editor
 * typed inside the value ends up in the graph (here a heading). */
const notionRichTextJsonLd = {
  '@context': 'https://schema.org](https://schema.org/)',
  '@graph': [
    {
      '@type': 'CollectionPage',
      '@id': 'https://nosgestesclimat.fr/#webpage',
      url: 'https://nosgestesclimat.fr/',
      name: 'Actions de réduction CO2',
    },
    {
      '@type': 'GovernmentOrganization',
      '@id':
        '[https://www.ademe.fr/#organization](https://www.ademe.fr/#organization)',
      name: 'ADEME',
      url: '[https://www.ademe.fr/](https://www.ademe.fr/)',
    },
    '###',
  ],
}

/** Clean document, as currently stored for an action (see NGC-3570). */
const cleanActionJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'CollectionPage',
      '@id': 'https://nosgestesclimat.fr/#webpage',
      url: 'https://nosgestesclimat.fr/',
      inLanguage: 'fr-FR',
      isPartOf: { '@id': 'https://nosgestesclimat.fr/#website' },
    },
    {
      '@type': 'Guide',
      '@id':
        'https://nosgestesclimat.fr/actions/alimentation/consommation-responsable-produit-mer',
      audience: { '@type': 'Audience', audienceType: 'Citoyens' },
    },
  ],
}

describe('cleanJsonLd', () => {
  it('states the schema.org context once, at document level', () => {
    expect(cleanJsonLd(notionRichTextJsonLd)?.['@context']).toBe(
      'https://schema.org'
    )
  })

  it('drops the graph entries that are not nodes', () => {
    expect(cleanJsonLd(notionRichTextJsonLd)?.['@graph']).toHaveLength(2)
  })

  it('unwraps the Markdown links Notion writes around URLs', () => {
    const nodes = cleanJsonLd(notionRichTextJsonLd)?.['@graph'] ?? []

    expect(nodes[1]).toEqual({
      '@type': 'GovernmentOrganization',
      '@id': 'https://www.ademe.fr/#organization',
      name: 'ADEME',
      url: 'https://www.ademe.fr/',
    })
    expect(JSON.stringify(nodes)).not.toContain('](')
  })

  it('wraps a single node in a graph', () => {
    expect(
      cleanJsonLd({ '@type': 'WebPage', '@id': 'https://x.test/' })
    ).toEqual({
      '@context': 'https://schema.org',
      '@graph': [{ '@type': 'WebPage', '@id': 'https://x.test/' }],
    })
  })

  it('removes the context repeated inside the nodes', () => {
    expect(
      cleanJsonLd({
        '@graph': [{ '@context': 'https://schema.org', '@type': 'WebPage' }],
      })?.['@graph']
    ).toEqual([{ '@type': 'WebPage' }])
  })

  it('keeps a document that holds no Notion artefact', () => {
    expect(cleanJsonLd(cleanActionJsonLd)).toEqual(cleanActionJsonLd)
  })

  it.each([
    ['nothing', undefined],
    ['an empty object', {}],
    ['an empty graph', { '@context': 'https://schema.org', '@graph': [] }],
    ['only Markdown leftovers', { '@graph': ['###', ''] }],
  ])('returns null when the value holds %s', (_label, value) => {
    expect(cleanJsonLd(value)).toBeNull()
  })
})
