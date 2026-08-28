import { prisma } from '../../../prisma/client.ts'
import type { ComputedResultSchema } from '../validators/computed-results.schema.ts'
import { hasValidComputedResults } from '../validators/computed-results.schema.ts'

const latestSimulationSelect = {
  id: true,
  progression: true,
  model: true,
  computedResults: true,
} as const

type LatestSimulationRow = {
  id: string
  progression: number
  model: string
  computedResults: ComputedResultSchema
}

const findLatestValid = async (where: {
  userId: string
  progression?: number
}): Promise<LatestSimulationRow | null> => {
  const row = await prisma.simulation.findFirst({
    where,
    orderBy: { date: 'desc' },
    select: latestSimulationSelect,
  })

  return row && hasValidComputedResults(row) ? row : null
}

export const findLatestSimulationProgress = ({
  userId,
}: {
  userId: string
}): Promise<LatestSimulationRow | null> => findLatestValid({ userId })

export const findLatestCompletedSimulationProgress = async ({
  userId,
}: {
  userId: string
}): Promise<(LatestSimulationRow & { progression: 1 }) | null> => {
  const row = await findLatestValid({ userId, progression: 1 })

  return row && { ...row, progression: 1 }
}
