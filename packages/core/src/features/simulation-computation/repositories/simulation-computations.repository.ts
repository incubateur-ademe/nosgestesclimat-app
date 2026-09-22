import type { Result } from '../../../lib/result.ts'
import { failure, success } from '../../../lib/result.ts'
import type { Transaction } from '../../../lib/transaction.ts'
import { prisma } from '../../../prisma/client.ts'
import { isPrismaErrorUniqueConstraintFailed } from '../../../prisma/utils.ts'
import { ComputationAlreadyExistsError } from '../errors/simulation-computation.error.ts'
import type { SimulationComputationStatus } from '../types/computation.ts'
import { mapSimulation } from './simulation.mapper.ts'

const STALE_PROCESSING_TIMEOUT_SECONDS = 30

const CLAIM_QUERY = `
  SELECT "simulationId"
  FROM "ngc"."SimulationComputation"
  WHERE status = 'pending'
     OR (
       status = 'processing'
       AND "startedAt" < NOW() - INTERVAL '${STALE_PROCESSING_TIMEOUT_SECONDS} seconds'
     )
  ORDER BY "createdAt" ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED
`

export const createSimulationComputation = async (
  simulationId: string,
  tx: Transaction = prisma
): Promise<Result<void, ComputationAlreadyExistsError>> => {
  try {
    await tx.simulationComputation.create({
      data: { simulationId, status: 'pending' },
    })
    return success()
  } catch (error) {
    if (isPrismaErrorUniqueConstraintFailed(error)) {
      return failure(new ComputationAlreadyExistsError(simulationId))
    }
    throw error
  }
}

export const findSimulationComputation = async (simulationId: string) =>
  prisma.simulationComputation.findUnique({
    where: { simulationId },
  })

/**
 * The user's latest finished simulation and its computation status, whatever
 * the status — `null` when the simulation has no computation row (model
 * unsupported at completion, or predating the computation feature),
 * `undefined` when the user has no finished simulation.
 */
export interface LastFinishedSimulationComputation {
  simulationId: string
  status: SimulationComputationStatus | null
}

export const findLastFinishedSimulationComputationByUserId = async (
  userId: string | undefined
): Promise<LastFinishedSimulationComputation | undefined> => {
  if (!userId) return undefined
  // A computation is only created for finished simulations, but a finished
  // simulation can have none: model unsupported at completion, or simulation
  // predating the computation feature.
  const simulation = await prisma.simulation.findFirst({
    where: { userId, progression: 1 },
    orderBy: { createdAt: 'desc' },
    include: { computations: { select: { status: true } } },
  })
  if (!simulation) return undefined
  return {
    simulationId: simulation.id,
    status: simulation.computations[0]?.status ?? null,
  }
}

export const claimNextPendingSimulationComputation = async () =>
  prisma.$transaction(async (tx) => {
    const jobs =
      await tx.$queryRawUnsafe<Array<{ simulationId: string }>>(CLAIM_QUERY)
    if (jobs.length === 0) return null
    const { simulationId } = jobs[0]
    const result = await tx.simulationComputation.update({
      where: { simulationId },
      include: { simulation: true },
      data: { status: 'processing', startedAt: new Date() },
    })
    return { simulation: mapSimulation(result.simulation) }
  })

export const markSimulationComputationCompleted = async (
  simulationId: string
): Promise<void> => {
  await prisma.simulationComputation.update({
    where: { simulationId },
    data: { status: 'completed', completedAt: new Date() },
  })
}

export const markSimulationComputationFailed = async (
  simulationId: string
): Promise<void> => {
  await prisma.simulationComputation.update({
    where: { simulationId },
    data: { status: 'failed', completedAt: new Date() },
  })
}
