import { prisma } from '../../../prisma/client.ts'
import { SimulationNotFound } from '../exceptions/simulations.exception.ts'
import type { Simulation } from '../types/simulation.ts'
import type { ComputedResultSchema } from '../validators/computed-results.schema.ts'
import { hasValidComputedResults } from '../validators/computed-results.schema.ts'
import { mapSimulation } from './simulation.mapper.ts'

export const getSimulationById = async (id: string): Promise<Simulation> => {
  const simulation = await prisma.simulation.findUnique({ where: { id } })

  if (!simulation) {
    throw new SimulationNotFound({ simulationId: id })
  }

  return mapSimulation(simulation)
}

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

export const findLatestSimulation = ({
  userId,
}: {
  userId: string
}): Promise<LatestSimulationRow | null> => findLatestValid({ userId })

export const findLatestCompletedSimulation = async ({
  userId,
}: {
  userId: string
}): Promise<(LatestSimulationRow & { progression: 1 }) | null> => {
  const row = await findLatestValid({ userId, progression: 1 })

  return row && { ...row, progression: 1 }
}
