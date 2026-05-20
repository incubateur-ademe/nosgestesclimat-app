import { prisma } from '../../../prisma/client.ts'
import { themesById } from '../data/themes/index.ts'
import type { Action } from '../types/action.ts'
import type { DbActionWithRelations } from './action.mapper.ts'
import { mapAction } from './action.mapper.ts'

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
