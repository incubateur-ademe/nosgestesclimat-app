import { describe, expect, it } from 'vitest'
import { cleanJsonLd } from '../notion-json-ld.ts'

/** Verbatim JSON-LD stored in the actions catalogue (see NGC-3570): the
 * context is Markdown-wrapped, the organization URLs are too, and the editor
 * appended a Markdown heading to the graph. */
const storedCatalogueJsonLd = {
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

describe('cleanJsonLd', () => {
  it('states the schema.org context once, at document level', () => {
    expect(cleanJsonLd(storedCatalogueJsonLd)?.['@context']).toBe(
      'https://schema.org'
    )
  })

  it('drops the graph entries that are not nodes', () => {
    expect(cleanJsonLd(storedCatalogueJsonLd)?.['@graph']).toHaveLength(2)
  })

  it('unwraps the Markdown links Notion writes around URLs', () => {
    const nodes = cleanJsonLd(storedCatalogueJsonLd)?.['@graph'] ?? []

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

  it.each([
    ['nothing', undefined],
    ['an empty object', {}],
    ['an empty graph', { '@context': 'https://schema.org', '@graph': [] }],
    ['only Markdown leftovers', { '@graph': ['###', ''] }],
  ])('returns null when the value holds %s', (_label, value) => {
    expect(cleanJsonLd(value)).toBeNull()
  })
})
