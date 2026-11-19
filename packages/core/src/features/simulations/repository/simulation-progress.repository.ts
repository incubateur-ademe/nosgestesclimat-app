import { prisma } from '../../../prisma/client.ts'
import type { SimulationStatus } from '../../../prisma/generated/client.ts'
import type { ModelString } from '../../models/helpers/model-versions.ts'
import {
  COMPLETED_SIMULATION_STATUSES,
  isCompletedSimulationStatus,
} from '../helpers/simulation-guards.ts'
import type {
  CompletedSimulation,
  SimulationProgress,
} from '../types/simulation-progress.ts'
import {
  hasValidComputedResults,
  type ComputedResults,
} from '../validators/computed-results.schema.ts'
import { isValidSimulation } from '../validators/simulation.validator.ts'

const latestSimulationSelect = {
  id: true,
  status: true,
  model: true,
  computedResults: true,
} as const

type SimulationProgressRow<S extends SimulationStatus = SimulationStatus> = {
  id: string
  status: S
  model: ModelString
  computedResults: ComputedResults
}

const toProgress = <S extends SimulationStatus>({
  id,
  status,
  model,
}: SimulationProgressRow<S>): SimulationProgress & { status: S } => ({
  id,
  status,
  model,
})

const findLatestValid = async (where: {
  userId: string
  status?: { in: SimulationStatus[] }
}): Promise<SimulationProgressRow | null> => {
  const row = await prisma.simulation.findFirst({
    where,
    orderBy: { date: 'desc' },
    select: latestSimulationSelect,
  })

  return row && isValidSimulation(row) ? row : null
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
}): Promise<CompletedSimulation | null> => {
  const row = await findLatestValid({
    userId,
    status: { in: [...COMPLETED_SIMULATION_STATUSES] },
  })

  if (!row || !isCompletedSimulationStatus(row.status)) return null

  return toProgress({ ...row, status: row.status })
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

  // cannot validate model string here in order to be able to update it
  return row && hasValidComputedResults(row)
    ? toProgress({ ...row, model: row.model as ModelString })
    : null
}
