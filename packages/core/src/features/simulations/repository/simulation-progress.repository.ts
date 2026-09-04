import { prisma } from '../../../prisma/client.ts'
import type {
  CompletedSimulationProgress,
  SimulationProgress,
} from '../types/simulation-progress.ts'
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

const toProgress = <Progression extends number>(row: {
  id: string
  progression: Progression
  model: string
}): { id: string; progression: Progression; model: string } => ({
  id: row.id,
  progression: row.progression,
  model: row.model,
})

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

export const findLatestSimulationProgress = async ({
  userId,
}: {
  userId: string
}): Promise<SimulationProgress | null> => {
  const row = await findLatestValid({ userId })

  return row ? toProgress(row) : null
}

export const findLatestCompletedSimulationProgress = async ({
  userId,
}: {
  userId: string
}): Promise<CompletedSimulationProgress | null> => {
  const row = await findLatestValid({ userId, progression: 1 })

  return row ? toProgress({ ...row, progression: 1 as const }) : null
}

export const findSimulationProgressById = async ({
  id,
  userId,
}: {
  id: string
  userId: string
}): Promise<SimulationProgress | null> => {
  const row = await prisma.simulation.findFirst({
    where: { id, userId },
    select: latestSimulationSelect,
  })

  return row && hasValidComputedResults(row) ? toProgress(row) : null
}
