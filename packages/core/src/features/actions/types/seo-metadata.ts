import type { Graph } from 'schema-dts'

export interface SeoMetadata {
  title?: string | null
  description?: string | null
  jsonLd?: Graph | null
}
