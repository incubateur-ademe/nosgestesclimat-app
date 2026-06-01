import { prisma } from '../../../prisma/client.ts'
import { isPrismaErrorUniqueConstraintFailed } from '../../../prisma/utils.ts'
import { mapSimulation } from '../../simulations/repository/simulation.mapper.ts'
import { ComputationAlreadyExists } from '../exceptions/simulation-computation.exception.ts'

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
  simulationId: string
): Promise<void> => {
  try {
    await prisma.simulationComputation.create({
      data: { simulationId, status: 'pending' },
    })
  } catch (error) {
    if (isPrismaErrorUniqueConstraintFailed(error)) {
      throw new ComputationAlreadyExists({ simulationId })
    }
    throw error
  }
}

export const findSimulationComputation = async (simulationId: string) =>
  prisma.simulationComputation.findUnique({
    where: { simulationId },
  })

export const claimNextPendingSimulationComputation = async () =>
  prisma.$transaction(async (tx) => {
    const jobs =
      await tx.$queryRawUnsafe<Array<{ simulationId: string }>>(CLAIM_QUERY)

    if (jobs.length === 0) return null

    const { simulationId } = jobs[0]
    const result = await tx.simulationComputation.update({
      where: { simulationId },
      include: {
        simulation: true,
      },
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
