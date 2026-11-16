import * as v from 'valibot'
import type { Prisma } from '../../../prisma/generated/client.ts'
import type { SeoMetadataModel } from '../../../prisma/generated/models.ts'
import type { SeoMetadata } from '../types/seo-metadata.ts'

/** The CMS stores JSON-LD as free-form JSON: only the document shape is
 * checked here, the content itself stays the consumer's responsibility. */
const JsonLdInputSchema = v.union([
  v.record(v.string(), v.unknown()),
  v.array(v.unknown()),
])

const parseJsonLd = (value: unknown) =>
  v.is(JsonLdInputSchema, value) ? value : undefined

export const mapSeoMetadata = (
  dbSeoMetadata: SeoMetadataModel | null
): SeoMetadata => ({
  title: dbSeoMetadata?.title ?? undefined,
  description: dbSeoMetadata?.description ?? undefined,
  jsonLd: parseJsonLd(dbSeoMetadata?.jsonLd),
})

export const mapSeoMetadataToPrismaCreate = (
  metadata?: SeoMetadata | null
): { create: Prisma.SeoMetadataCreateWithoutActionTranslationInput } => ({
  create: {
    title: metadata?.title ?? null,
    description: metadata?.description ?? null,
    jsonLd: (metadata?.jsonLd as Prisma.InputJsonValue) ?? null,
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
      jsonLd: metadata?.jsonLd as Prisma.InputJsonValue | undefined,
    },
  },
})
