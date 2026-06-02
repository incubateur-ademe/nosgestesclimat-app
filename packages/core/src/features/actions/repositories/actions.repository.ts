import { prisma } from '../../../prisma/client.ts'
import { themesById } from '../data/themes/index.ts'
import type { Action, NewAction, UpdatedAction } from '../types/action.ts'
import type { DbActionWithRelations } from './action.mapper.ts'
import {
  mapAction,
  mapNewActionToPrisma,
  mapUpdatedActionToPrisma,
} from './action.mapper.ts'

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

export const findAllActions = async ({
  includeDeleted = false,
}: { includeDeleted?: boolean } = {}): Promise<Action[]> => {
  const dbActions = await prisma.action.findMany({
    where: includeDeleted ? undefined : { deletedAt: null },
    include: {
      seoMetadata: true,
    },
  })

  return dbActions.map((dbAction) => {
    const theme = themesById[dbAction.themeId]
    return mapAction(dbAction, theme)
  })
}

export const findVisibleActions = async (): Promise<Action[]> => {
  const dbActions = await prisma.action.findMany({
    where: getVisibleFilter(),
    include: {
      seoMetadata: true,
    },
  })

  return dbActions.map((dbAction: DbActionWithRelations) => {
    const theme = themesById[dbAction.themeId]
    return mapAction(dbAction, theme)
  })
}

export const findVisibleActionBySlug = async (
  slug: string
): Promise<Action | null> => {
  const dbAction = await prisma.action.findUnique({
    where: {
      slug,
      ...getVisibleFilter(),
    },
    include: {
      seoMetadata: true,
    },
  })

  if (!dbAction) {
    return null
  }

  const theme = themesById[dbAction.themeId]
  return mapAction(dbAction, theme)
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
    data: mapUpdatedActionToPrisma(data),
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
