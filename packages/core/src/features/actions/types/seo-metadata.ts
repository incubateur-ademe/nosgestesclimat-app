export interface SeoMetadata {
  title?: string | null
  description?: string | null
  /**
   * JSON-LD document authored in the CMS and rendered as stored: the site has
   * no logic to detect or repair an invalid document.
   */
  jsonLd?: Record<string, unknown> | null
}
