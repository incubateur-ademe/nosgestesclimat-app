export interface SeoMetadata {
  title?: string | null
  description?: string | null
  /**
   * Raw JSON-LD authored in the CMS. It is stored as free-form JSON, so it is
   * typed as `unknown`: consumers must validate/shape it before use, and the
   * repository rejects values that are neither an object nor an array.
   */
  jsonLd?: unknown
}
