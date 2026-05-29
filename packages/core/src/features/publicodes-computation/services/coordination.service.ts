import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import type Engine from 'publicodes'
import { logException } from '../../logger/logger.service.ts'
import { SimulationComputationFail } from '../exceptions/coordination.exception.ts'
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
  engine: Engine<DottedName>
): Promise<boolean> => {
  const job = await claimNextPendingSimulationComputation()
  if (!job) return false
  try {
    await computeDerivedSimulationData(engine, job.simulation)
    await markSimulationComputationCompleted(job.simulation.id)
    return true
  } catch (error) {
    try {
      await markSimulationComputationFailed(job.simulation.id)
      logException(
        new SimulationComputationFail({
          simulationId: job.simulation.id,
          cause: error,
        })
      )
    } catch (cleanupError) {
      logException(
        new SimulationComputationFail({
          simulationId: job.simulation.id,
          cause: new SuppressedError(cleanupError, error),
        })
      )
    }
    throw error
  }
}
