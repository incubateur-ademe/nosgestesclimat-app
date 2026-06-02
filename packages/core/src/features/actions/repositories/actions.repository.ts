import { prisma } from '../../../prisma/client.ts'
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

  return dbActions.map((dbAction) => {
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

export const findVisiblePersonalizedActionBySlug = async (
  slug: string,
  userId: string
): Promise<PersonalizedAction | null> => {
  const [action, simulation] = await Promise.all([
    findVisibleActionBySlug(slug),
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
  userId: string
): Promise<PersonalizedAction[]> => {
  const [actions, simulation] = await Promise.all([
    findVisibleActions(),
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
    distinct: ['actionId'],
  })

  const latestByActionId = new Map(assessments.map((a) => [a.actionId, a]))

  return actions.map((action) =>
    mapPersonalizedAction(action, latestByActionId.get(action.id) ?? null)
  )
}

// TODO: move to a separate repository file
const findLastCompletedSimulationByUserId = async (userId: string) => {
  return prisma.simulation.findFirst({
    select: { id: true },
    where: {
      userId,
      progression: 1,
    },
    orderBy: { createdAt: 'desc' },
  })
}
