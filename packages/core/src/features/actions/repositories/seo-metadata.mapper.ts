import type { SeoMetadataModel } from '../../../prisma/generated/models.ts'
import type { SeoMetadata } from '../types/seo-metadata.ts'

export const mapSeoMetadata = (
  dbSeoMetadata: SeoMetadataModel | null
): SeoMetadata => ({
  title: dbSeoMetadata?.title ?? undefined,
  description: dbSeoMetadata?.description ?? undefined,
  jsonLd: (dbSeoMetadata?.jsonLd ?? undefined) as SeoMetadata['jsonLd'],
})
