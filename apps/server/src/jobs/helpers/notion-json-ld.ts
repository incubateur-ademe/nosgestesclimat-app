import type {
  JsonLdDocument,
  JsonLdNode,
} from '@nosgestesclimat/core/features/actions/types/seo-metadata'

const SCHEMA_CONTEXT = 'https://schema.org'

/** Keys whose value is a URL: Notion auto-formats bare URLs as Markdown links,
 * including inside the JSON-LD stored in a rich text property. */
const URL_KEYS = new Set([
  '@id',
  'url',
  'item',
  'sameAs',
  'contentUrl',
  'embedUrl',
])

const MARKDOWN_LINK = /^\[[^\]]*\]\(([^)]+)\)$/

/**
 * Cleans the JSON-LD authored in Notion before it is stored:
 * - Markdown links are unwrapped (`[https://x](https://x)` -> `https://x`),
 * - `@graph` entries that are not nodes are dropped (the editor appends
 *   Markdown headings to the JSON),
 * - `@context` is stated once, by the document itself,
 * - the document is always stored as a single node list (`@graph`).
 *
 * Returns `null` when the value holds no usable node, so that consumers fall
 * back to the JSON-LD they generate.
 */
export function cleanJsonLd(value: unknown): JsonLdDocument | null {
  const nodes = collectNodes(value)

  if (nodes.length === 0) return null

  return { '@context': SCHEMA_CONTEXT, '@graph': nodes }
}

function collectNodes(value: unknown): JsonLdNode[] {
  const values: unknown[] = Array.isArray(value) ? value : [value]

  return values.flatMap((item) => {
    const node = asNode(item)
    if (!node) return []

    const graph = node['@graph']
    if (Array.isArray(graph)) return collectNodes(graph)

    const { '@context': _context, ...rest } = node
    const cleaned = cleanUrls(rest) as JsonLdNode

    return Object.keys(cleaned).length > 0 ? [cleaned] : []
  })
}

function cleanUrls(value: unknown, key?: string): unknown {
  if (typeof value === 'string') {
    return key && URL_KEYS.has(key) ? unwrapMarkdownLink(value) : value
  }

  if (Array.isArray(value)) return value.map((item) => cleanUrls(item, key))

  const node = asNode(value)
  if (!node) return value

  return Object.fromEntries(
    Object.entries(node).map(([childKey, child]) => [
      childKey,
      cleanUrls(child, childKey),
    ])
  )
}

function unwrapMarkdownLink(value: string) {
  return MARKDOWN_LINK.exec(value)?.[1] ?? value
}

function asNode(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null
}
