import type Engine from 'publicodes'
import {
  claimNextPendingSimulationComputation,
  markSimulationComputationCompleted,
  markSimulationComputationFailed,
} from '../repositories/simulation-computations.repository.ts'
import { computeDerivedSimulationData } from './simulation-computation.service.ts'

/**
 * Entry point called by the worker in a loop.
 *
 * Claims the next pending SimulationComputation job, processes it with the
 * provided engine, and marks it as completed or failed.
 *
 * Returns `true` if a job was processed, `false` if the queue was empty.
 */
export const processNextPendingComputation = async (
  engine: Engine
): Promise<boolean> => {
  const job = await claimNextPendingSimulationComputation()
  if (!job) return false

  try {
    await computeDerivedSimulationData(engine, job.simulationId)
    await markSimulationComputationCompleted(job.simulationId)
    return true
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    try {
      await markSimulationComputationFailed(job.simulationId, message)
    } catch {
      // Best-effort: ignore failure to mark the job as failed
    }
    throw error
  }
}
