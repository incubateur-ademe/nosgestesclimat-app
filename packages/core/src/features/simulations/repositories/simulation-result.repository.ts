import { prisma } from '../../../prisma/client.ts'
import type { SimulationResult } from '../types/simulation-result.ts'
import { mapSimulationResult } from './simulation-result.mapper.ts'

const include = {
  groups: {
    select: {
      group: { select: { id: true, name: true } },
    },
  },
  polls: {
    select: {
      poll: { select: { id: true, name: true, slug: true } },
    },
  },
  computedResults: true,
} as const

export const findSimulationResult = async (
  id: string
): Promise<SimulationResult | null> => {
  const result = await prisma.simulation.findUnique({
    where: { id },
    include,
  })

  return result ? mapSimulationResult(result) : null
}

export const findLatestSimulationResults = async (
  userId: string,
  n: number
): Promise<SimulationResult[]> => {
  const results = await prisma.simulation.findMany({
    where: { userId, progression: 1 },
    orderBy: { date: 'desc' },
    take: n,
    include,
  })

  return results.map(mapSimulationResult)
}
