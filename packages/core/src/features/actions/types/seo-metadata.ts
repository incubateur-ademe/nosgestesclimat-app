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

/**
 * JSON-LD document stored for a page.
 *
 * It is written in the CMS then cleaned and validated by the sync script
 * before being stored, so consumers can rely on this shape.
 */
export type JsonLdDocument = {
  '@context': string
  '@graph': JsonLdNode[]
}

export interface SeoMetadata {
  title?: string | null
  description?: string | null
  /** Structured data of the page, authored in the CMS */
  jsonLd?: JsonLdDocument | null
}
