import { prisma } from '../../../prisma/client.ts'
import type { Simulation } from '../types/simulation.ts'
import { mapSimulation } from './simulation.mapper.ts'

const simulationSelect = {
  id: true,
  date: true,
  model: true,
  progression: true,
  situation: true,
  extendedSituation: true,
  foldedSteps: true,
  actionChoices: true,
  computedResults: true,
  createdAt: true,
  updatedAt: true,
  userId: true,
  polls: {
    select: { pollId: true, poll: { select: { slug: true, name: true } } },
  },
  groups: { select: { groupId: true } },
} as const

export const findLatestSimulation = async ({
  userId,
}: {
  userId: string
}): Promise<Simulation | null> => {
  const row = await prisma.simulation.findFirst({
    where: { userId },
    orderBy: { date: 'desc' },
    select: simulationSelect,
  })

  return row ? mapSimulation(row) : null
}

export const findLatestCompletedSimulation = async ({
  userId,
}: {
  userId: string
}): Promise<Simulation | null> => {
  const row = await prisma.simulation.findFirst({
    where: { userId, progression: 1 },
    orderBy: { date: 'desc' },
    select: simulationSelect,
  })

  return row ? mapSimulation(row) : null
}

export const findCompletedSimulations = async ({
  userId,
  limit,
}: {
  userId: string
  limit?: number
}): Promise<Simulation[]> => {
  const rows = await prisma.simulation.findMany({
    where: { userId, progression: 1 },
    orderBy: { date: 'desc' },
    take: limit,
    select: simulationSelect,
  })

  return rows
    .map(mapSimulation)
    .filter((simulation): simulation is Simulation => simulation !== null)
}
