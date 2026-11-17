import type {
  JsonLdNode,
  JsonValue,
} from '@nosgestesclimat/core/features/actions/types/seo-metadata'

export type { JsonLdNode }

export const SCHEMA_CONTEXT = 'https://schema.org'
export const SITE_NAME = 'Nos Gestes Climat'
export const ADEME_ORGANIZATION_ID = 'https://www.ademe.fr/#organization'

/** Applies the page-owned values, then drops the fields the page must not
 * inherit from the stored document. */
export function patchNode(
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

export function hasType(node: JsonLdNode, type: string) {
  const nodeType = node['@type']

  return (Array.isArray(nodeType) ? nodeType : [nodeType]).includes(type)
}

/** Overrides `inLanguage` when the node states one: the document is served for
 * a single locale, so a value carried over from another one cannot stay. */
export function withLocale(node: JsonLdNode, locale: string): JsonLdNode {
  return 'inLanguage' in node ? { ...node, inLanguage: locale } : node
}

/** Appends the node a reference points at, when the stored document lacks it:
 * every `{ '@id': … }` of the page must resolve inside the same document. */
export function ensureNode(
  nodes: JsonLdNode[],
  id: string,
  create: () => JsonLdNode
) {
  if (!nodes.some((node) => node['@id'] === id)) {
    nodes.push(create())
  }
}

export function asNode(value: JsonValue): JsonLdNode | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value
    : null
}
