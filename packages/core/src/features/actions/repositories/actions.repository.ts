import { prisma } from '../../../prisma/client.ts'
import type { ISOSupportedLanguage } from '../../geo/types/language.ts'
import { themesById } from '../data/themes/index.ts'
import type {
  Action,
  NewAction,
  PersonalizedAction,
  UpdatedAction,
} from '../types/action.ts'
import {
  mapAction,
  mapNewActionToPrisma,
  mapPersonalizedAction,
  mapUpdatedActionToPrisma,
} from './action.mapper.ts'

const defaultLocale = 'fr' satisfies ISOSupportedLanguage

const getVisibleFilter = () => {
  const now = new Date()
  return {
    AND: [
      {
        OR: [{ deletedAt: null }, { deletedAt: { gt: now } }],
      },
      {
        publishedAt: { not: null, lte: now },
      },
    ],
  }
}

export const findAllActions = async (
  locale: ISOSupportedLanguage,
  { includeDeleted = false }: { includeDeleted?: boolean } = {}
): Promise<Action[]> => {
  const dbActions = await prisma.action.findMany({
    where: includeDeleted ? undefined : { deletedAt: null },
    include: {
      translations: { where: { locale }, include: { seoMetadata: true } },
    },
  })

  return dbActions
    .filter((dbAction) => dbAction.translations.length > 0)
    .map((dbAction) => {
      const theme = themesById[dbAction.themeId]
      return mapAction(dbAction, dbAction.translations[0], theme)
    })
}

export const findActionRuleIds = async (): Promise<
  { id: string; ruleId: string }[]
> => {
  return prisma.action.findMany({
    where: { deletedAt: null },
    select: { id: true, ruleId: true },
  })
}

export const findVisibleActions = async (
  locale: ISOSupportedLanguage,
  {
    orderBy,
    fallbackToDefaultLocale = false,
  }: {
    orderBy?: { title?: 'asc' | 'desc' }
    /**
     * When true, actions missing a translation for `locale` fall back to their
     * french content instead of being hidden.
     */
    fallbackToDefaultLocale?: boolean
  }
): Promise<Action[]> => {
  const locales = fallbackToDefaultLocale
    ? { in: [locale, defaultLocale] }
    : locale
  const dbActions = await prisma.action.findMany({
    where: getVisibleFilter(),
    include: {
      translations: {
        where: { locale: locales },
        include: { seoMetadata: true },
      },
    },
  })

  const actions = dbActions.flatMap((dbAction) => {
    const translation = fallbackToDefaultLocale
      ? (dbAction.translations.find((t) => t.locale === locale) ??
        dbAction.translations.find((t) => t.locale === defaultLocale))
      : dbAction.translations[0]
    if (!translation) return []
    const theme = themesById[dbAction.themeId]
    return mapAction(dbAction, translation, theme)
  })

  if (orderBy?.title) {
    actions.sort((a, b) =>
      orderBy.title === 'desc'
        ? b.title.localeCompare(a.title, locale)
        : a.title.localeCompare(b.title, locale)
    )
  }

  return actions
}

export const findVisibleActionSlugs = async (
  locale: ISOSupportedLanguage
): Promise<{ slug: string; themeSlug: string }[]> => {
  const dbActions = await prisma.action.findMany({
    where: getVisibleFilter(),
    select: {
      themeId: true,
      translations: { where: { locale }, select: { slug: true } },
    },
  })

  return dbActions
    .filter((dbAction) => dbAction.translations.length > 0)
    .map((dbAction) => {
      const theme = themesById[dbAction.themeId]
      return {
        slug: dbAction.translations[0].slug,
        themeSlug: locale === 'en' ? theme.slugEn : theme.slug,
      }
    })
}

export const findVisibleActionBySlug = async (
  slug: string,
  locale: ISOSupportedLanguage
): Promise<Action | null> => {
  const dbAction = await prisma.action.findFirst({
    where: {
      ...getVisibleFilter(),
      translations: { some: { locale, slug } },
    },
    include: {
      translations: { where: { locale }, include: { seoMetadata: true } },
    },
  })

  if (!dbAction) {
    return null
  }

  const translation = dbAction.translations[0]
  if (!translation) {
    return null
  }

  const theme = themesById[dbAction.themeId]
  return mapAction(dbAction, translation, theme)
}

export const findVisibleActionAlternateLocalesBySlug = async (
  slug: string
): Promise<
  Partial<
    Record<ISOSupportedLanguage, { actionSlug: string; themeSlug: string }>
  >
> => {
  const dbAction = await prisma.action.findFirst({
    where: {
      ...getVisibleFilter(),
      // The slug is matched against every locale so callers can resolve an
      // action from any language
      translations: { some: { slug } },
    },
    select: {
      themeId: true,
      translations: { select: { locale: true, slug: true } },
    },
  })

  if (!dbAction) {
    return {}
  }

  const theme = themesById[dbAction.themeId]

  return Object.fromEntries(
    dbAction.translations.map((translation) => [
      translation.locale,
      {
        actionSlug: translation.slug,
        themeSlug: translation.locale === 'en' ? theme.slugEn : theme.slug,
      },
    ])
  ) as Partial<
    Record<ISOSupportedLanguage, { actionSlug: string; themeSlug: string }>
  >
}

export const createManyActions = async (
  actions: NewAction[]
): Promise<void> => {
  // Prisma does not support nested writes in createMany
  await prisma.$transaction(
    actions.map((action) =>
      prisma.action.create({ data: mapNewActionToPrisma(action) })
    )
  )
}

export const updateAction = async (
  id: string,
  data: UpdatedAction
): Promise<void> => {
  await prisma.action.update({
    where: { id },
    data: mapUpdatedActionToPrisma(id, data),
  })
}

export const deleteManyActions = async (ids: string[]): Promise<number> => {
  const now = new Date()
  const result = await prisma.action.updateMany({
    where: {
      id: { in: ids },
    },
    data: { deletedAt: now },
  })

  return result.count
}

export const findVisiblePersonalizedActionBySlug = async (
  slug: string,
  locale: ISOSupportedLanguage,
  userId: string | undefined
): Promise<PersonalizedAction | null> => {
  const [action, simulation] = await Promise.all([
    findVisibleActionBySlug(slug, locale),
    findLastCompletedSimulationByUserId(userId),
  ])

  if (!action) return null
  if (!simulation) return mapPersonalizedAction(action, null)

  const assessment = await prisma.actionAssessment.findUnique({
    where: {
      simulationId_actionId: {
        actionId: action.id,
        simulationId: simulation.id,
      },
    },
  })

  return mapPersonalizedAction(action, assessment)
}

export const findAllVisiblePersonalizedActions = async (
  userId: string | undefined,
  locale: ISOSupportedLanguage,
  options: { fallbackToDefaultLocale?: boolean }
): Promise<PersonalizedAction[]> => {
  const [actions, simulation] = await Promise.all([
    findVisibleActions(locale, {
      fallbackToDefaultLocale: options.fallbackToDefaultLocale,
    }),
    findLastCompletedSimulationByUserId(userId),
  ])

  if (actions.length === 0) return []
  if (!simulation)
    return actions.map((action) => mapPersonalizedAction(action, null))

  const assessments = await prisma.actionAssessment.findMany({
    where: {
      actionId: { in: actions.map((a) => a.id) },
      simulationId: simulation.id,
    },
  })

  const latestByActionId = new Map(assessments.map((a) => [a.actionId, a]))

  return actions.map((action) =>
    mapPersonalizedAction(action, latestByActionId.get(action.id) ?? null)
  )
}

// TODO: move to a separate repository file
const findLastCompletedSimulationByUserId = async (
  userId: string | undefined
) => {
  if (!userId) return null
  return prisma.simulation.findFirst({
    select: { id: true },
    where: {
      userId,
      progression: 1,
    },
    orderBy: { createdAt: 'desc' },
  })
}
