import { prisma } from '../../../prisma/client.ts'
import { themesById } from '../data/themes/index.ts'
import type { Action } from '../types/action.ts'
import type { DbActionWithRelations } from './action.mapper.ts'
import { mapAction } from './action.mapper.ts'

export const findActions = async (): Promise<Action[]> => {
  const now = new Date()

  const dbActions = await prisma.action.findMany({
    where: {
      AND: [
        {
          OR: [{ deletedAt: null }, { deletedAt: { gt: now } }],
        },
        {
          publishedAt: { not: null, lte: now },
        },
      ],
    },
    include: {
      seoMetadata: true,
    },
  })

  return dbActions.map((dbAction: DbActionWithRelations) => {
    const theme = themesById[dbAction.themeId]
    return mapAction(dbAction, theme)
  })
}
