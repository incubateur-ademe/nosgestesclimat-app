import type { Graph } from 'schema-dts'
import type { Prisma } from '../../../prisma/generated/client.ts'
import type { SeoMetadataModel } from '../../../prisma/generated/models.ts'
import type { SeoMetadata } from '../types/seo-metadata.ts'

/** The stored JSON-LD is validated when written (see the Notion sync): reading
 * only casts the column back to the domain type. */
const toJsonLd = (jsonLd: Prisma.JsonValue | null | undefined) =>
  (jsonLd ?? undefined) as Graph | undefined

const toPrismaJsonLd = (jsonLd: Graph | null | undefined) =>
  jsonLd as unknown as Prisma.InputJsonValue | undefined

export const mapSeoMetadata = (
  dbSeoMetadata: SeoMetadataModel | null
): SeoMetadata => ({
  title: dbSeoMetadata?.title ?? undefined,
  description: dbSeoMetadata?.description ?? undefined,
  jsonLd: toJsonLd(dbSeoMetadata?.jsonLd),
})

export const mapSeoMetadataToPrismaCreate = (
  metadata?: SeoMetadata | null
): { create: Prisma.SeoMetadataCreateWithoutActionTranslationInput } => ({
  create: {
    title: metadata?.title ?? null,
    description: metadata?.description ?? null,
    jsonLd: toPrismaJsonLd(metadata?.jsonLd ?? null),
  },
})

export const mapSeoMetadataToPrismaUpsert = (
  metadata?: SeoMetadata | null
): { upsert: Prisma.SeoMetadataUpsertWithoutActionTranslationInput } => ({
  upsert: {
    ...mapSeoMetadataToPrismaCreate(metadata),
    update: {
      title: metadata?.title,
      description: metadata?.description,
      jsonLd: toPrismaJsonLd(metadata?.jsonLd),
    },
  },
})
