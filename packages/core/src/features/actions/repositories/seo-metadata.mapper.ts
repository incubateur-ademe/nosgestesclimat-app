import type { Prisma } from '../../../prisma/generated/client.ts'
import type { SeoMetadataModel } from '../../../prisma/generated/models.ts'
import type { SeoMetadata } from '../types/seo-metadata.ts'

export const mapSeoMetadata = (
  dbSeoMetadata: SeoMetadataModel | null
): SeoMetadata => ({
  title: dbSeoMetadata?.title ?? undefined,
  description: dbSeoMetadata?.description ?? undefined,
  jsonLd: (dbSeoMetadata?.jsonLd ?? undefined) as SeoMetadata['jsonLd'],
})

export const mapSeoMetadataToPrismaCreate = (
  metadata?: SeoMetadata | null
): { create: Prisma.SeoMetadataCreateWithoutActionInput } => ({
  create: {
    title: metadata?.title ?? null,
    description: metadata?.description ?? null,
    jsonLd: (metadata?.jsonLd as unknown as Prisma.InputJsonValue) ?? null,
  },
})

export const mapSeoMetadataToPrismaUpdate = (
  metadata?: SeoMetadata | null
): { create: Prisma.SeoMetadataCreateWithoutActionInput } => ({
  create: {
    title: metadata?.title ?? null,
    description: metadata?.description ?? null,
    jsonLd: (metadata?.jsonLd as unknown as Prisma.InputJsonValue) ?? null,
  },
})

export const mapSeoMetadataToPrismaUpsert = (
  metadata?: SeoMetadata | null
): { upsert: Prisma.SeoMetadataUpsertWithoutActionInput } => ({
  upsert: {
    create: mapSeoMetadataToPrismaCreate(metadata),
    update: {
      title: metadata?.title ?? undefined,
      description: metadata?.description ?? undefined,
      jsonLd: metadata?.jsonLd as unknown as Prisma.InputJsonValue | undefined,
    },
  },
})
