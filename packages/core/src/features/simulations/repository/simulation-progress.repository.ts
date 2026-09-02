import { prisma } from '../../../prisma/client.ts'
import {
  hasValidComputedResults,
  type ComputedResults,
} from '../validators/computed-results.schema.ts'

const latestSimulationSelect = {
  id: true,
  progression: true,
  model: true,
  computedResults: true,
} as const

type SimulationProgressRow = {
  id: string
  progression: number
  model: string
  computedResults: ComputedResults
}

const findLatestValid = async (where: {
  userId: string
  progression?: number
}): Promise<SimulationProgressRow | null> => {
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
}): Promise<SimulationProgressRow | null> => findLatestValid({ userId })

export const findLatestCompletedSimulationProgress = async ({
  userId,
}: {
  userId: string
}): Promise<(SimulationProgressRow & { progression: 1 }) | null> => {
  const row = await findLatestValid({ userId, progression: 1 })

  return row && { ...row, progression: 1 }
}

export const findSimulationProgressById = async ({
  id,
  userId,
}: {
  id: string
  userId: string
}): Promise<SimulationProgressRow | null> => {
  const row = await prisma.simulation.findFirst({
    where: { id, userId },
    select: latestSimulationSelect,
  })

  return row && hasValidComputedResults(row) ? row : null
}
