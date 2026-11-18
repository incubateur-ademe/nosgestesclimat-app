import type { Graph } from 'schema-dts'

/** Any value that a JSON column can hold. */
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue }

/** A JSON-LD node, such as a `WebPage` or a `BreadcrumbList`. */
export type JsonLdNode = { [key: string]: JsonValue }

export type JsonLdDocument = Graph

export interface SeoMetadata {
  title?: string | null
  description?: string | null
  jsonLd?: JsonLdDocument | null
}
