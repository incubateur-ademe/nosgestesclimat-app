import type { Prisma } from '../../../prisma/generated/client.ts'
import type {
  ActionTranslationInput,
  NewAction,
  UpdatedAction,
} from '../types/action.ts'
import {
  mapSeoMetadataToPrismaCreate,
  mapSeoMetadataToPrismaUpsert,
} from './seo-metadata.mapper.ts'

const mapTranslationInputToPrismaCreate = (
  locale: string,
  input: ActionTranslationInput
): Prisma.ActionTranslationCreateWithoutActionInput => ({
  locale,
  title: input.title,
  slug: input.slug,
  longDescription: input.longDescription,
  media: input.media as Prisma.InputJsonValue | undefined,
  tips: input.tips,
  financialIncentives: input.financialIncentives,
  furtherExplore: input.furtherExplore,
  seoMetadata: mapSeoMetadataToPrismaCreate(input.metadata),
})

export const mapActionTranslationsToPrismaCreate = (
  translations: NewAction['translations']
): Prisma.ActionTranslationCreateNestedManyWithoutActionInput | undefined => {
  if (!translations) return undefined

  const create: Prisma.ActionTranslationCreateWithoutActionInput[] = []

  for (const [locale, translation] of Object.entries(translations)) {
    if (translation) {
      create.push(mapTranslationInputToPrismaCreate(locale, translation))
    }
  }

  return { create }
}

const mapTranslationInputToPrismaUpsert = (
  actionId: string,
  locale: string,
  input: ActionTranslationInput
): Prisma.ActionTranslationUpsertWithWhereUniqueWithoutActionInput => ({
  where: { actionId_locale: { actionId, locale } },
  create: mapTranslationInputToPrismaCreate(locale, input),
  update: {
    title: input.title,
    slug: input.slug,
    longDescription: input.longDescription,
    media: input.media as Prisma.InputJsonValue | undefined,
    tips: input.tips,
    financialIncentives: input.financialIncentives,
    furtherExplore: input.furtherExplore,
    // undefined metadata means "leave the existing SEO metadata untouched"
    seoMetadata:
      typeof input.metadata === 'undefined'
        ? undefined
        : mapSeoMetadataToPrismaUpsert(input.metadata),
  },
})

export const mapActionTranslationsToPrismaUpdate = (
  actionId: string,
  translations: UpdatedAction['translations']
): Prisma.ActionTranslationUpdateManyWithoutActionNestedInput | undefined => {
  if (!translations) return undefined

  const upsert: Prisma.ActionTranslationUpsertWithWhereUniqueWithoutActionInput[] =
    []
  const deleteLocales: string[] = []

  for (const [locale, translation] of Object.entries(translations)) {
    if (translation === undefined) {
      // an absent / undefined translation keeps the existing one untouched
      continue
    }
    if (translation === null) {
      deleteLocales.push(locale)
    } else {
      upsert.push(
        mapTranslationInputToPrismaUpsert(actionId, locale, translation)
      )
    }
  }

  return {
    upsert,
    // null values mean the fields were cleared for that locale:
    // remove the stale translation so the action hides again for that locale
    deleteMany:
      deleteLocales.length > 0 ? { locale: { in: deleteLocales } } : undefined,
  }
}
