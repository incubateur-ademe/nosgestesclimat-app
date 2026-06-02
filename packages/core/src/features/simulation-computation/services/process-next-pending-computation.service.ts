import type Engine from 'publicodes'
import { assessActions } from '../../actions/services/assess-actions.service.ts'
import type { Simulation } from '../../simulations/types/simulation.ts'
import { SimulationComputationFailedException } from '../exceptions/simulation-computation.exception.ts'
import {
  claimNextPendingSimulationComputation,
  markSimulationComputationCompleted,
  markSimulationComputationFailed,
} from '../repositories/simulation-computations.repository.ts'

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
    await computeDerivedSimulationData(engine, job.simulation)
    await markSimulationComputationCompleted(job.simulation.id)
    return true
  } catch (error) {
    try {
      await markSimulationComputationFailed(job.simulation.id)
    } catch (cleanupError) {
      throw new SimulationComputationFailedException({
        simulationId: job.simulation.id,
        cause: new SuppressedError(cleanupError, error),
      })
    }
    throw new SimulationComputationFailedException({
      simulationId: job.simulation.id,
      cause: error,
    })
  }
}

/**
 * Computes all data derived from a simulation in a single engine pass.
 *
 * `setSituation` is called once — all subsequent evaluate() calls
 * benefit from the publicodes internal cache.
 */
const computeDerivedSimulationData = async (
  engine: Engine,
  simulation: Simulation
): Promise<void> => {
  engine.setSituation(
    simulation.situation as Parameters<typeof engine.setSituation>[0]
  )

  await assessActions(engine, simulation.id)
}
