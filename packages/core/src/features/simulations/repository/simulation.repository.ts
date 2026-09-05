import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import type { Situation } from 'publicodes'
import type { Result } from '../../../lib/result.ts'
import { failure, success } from '../../../lib/result.ts'
import type { Transaction } from '../../../lib/transaction.ts'
import { prisma } from '../../../prisma/client.ts'
import type { Prisma } from '../../../prisma/generated/client.ts'
import { isPrismaErrorNotFound } from '../../../prisma/utils.ts'
import { SimulationNotFoundError } from '../errors/simulations.error.ts'
import type { Simulation } from '../types/simulation.ts'
import type { ComputedResults } from '../validators/computed-results.schema.ts'
import { mapSimulation } from './simulation.mapper.ts'

const simulationSelect = {
  id: true,
  date: true,
  model: true,
  progression: true,
  situation: true,
  foldedSteps: true,
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

export const findSimulationById = async ({
  id,
  userId,
}: {
  id: string
  userId: string
}): Promise<Simulation | null> => {
  const row = await prisma.simulation.findFirst({
    where: { id, userId },
    select: simulationSelect,
  })

  return row ? mapSimulation(row) : null
}

export const updateSimulation = async (
  {
    id,
    userId,
    situation,
    foldedSteps,
    progression,
    computedResults,
    model,
  }: {
    id: string
    userId: string
    situation: Situation<DottedName>
    foldedSteps: DottedName[]
    progression: number
    computedResults: ComputedResults
    model?: string
  },
  tx: Transaction = prisma
): Promise<Result<void, SimulationNotFoundError>> => {
  try {
    await tx.simulation.update({
      // `userId` stays in the `where` so that ownership is enforced atomically at write time rather than by a preceding read.
      where: { id, userId },
      data: {
        situation: situation as unknown as Prisma.InputJsonValue,
        foldedSteps: foldedSteps as unknown as Prisma.InputJsonValue[],
        progression,
        computedResults: computedResults as unknown as Prisma.InputJsonValue,
        ...(model ? { model } : {}),
      },
      // `select` is narrowed to the id to reduce data transfer because Prisma
      // always returns a row: nothing here reads it.
      select: { id: true },
    })

    return success()
  } catch (error) {
    if (isPrismaErrorNotFound(error)) {
      return failure(new SimulationNotFoundError())
    }
    throw error
  }
}
