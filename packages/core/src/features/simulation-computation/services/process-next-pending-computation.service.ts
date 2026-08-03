import type Engine from 'publicodes'
import type { Simulation } from '../../simulations/types/simulation.ts'
import { SimulationComputationFailedException } from '../exceptions/simulation-computation.exception.ts'
import {
  claimNextPendingSimulationComputation,
  markSimulationComputationCompleted,
  markSimulationComputationFailed,
} from '../repositories/simulation-computations.repository.ts'

interface ProcessNextPendingComputationDeps {
  assessActions: (engine: Engine, simulationId: string) => Promise<void>
}

/**
 * Entry point called by the worker in a loop.
 *
 * Claims the next pending SimulationComputation job, resolves the engine
 * matching the job's model, processes the job with it,
 * and marks it as completed or failed.
 *
 * Returns `true` if a job was processed, `false` if the queue was empty.
 */
export function createProcessNextPendingComputation(
  deps: ProcessNextPendingComputationDeps
) {
  const { assessActions } = deps
  return async function processNextPendingComputation(
    getEngine: (model: Simulation['model']) => Promise<Engine> | Engine
  ): Promise<boolean> {
    const job = await claimNextPendingSimulationComputation()
    if (!job) return false
    let engine: Engine | undefined
    try {
      // Computes all data derived from a simulation in a single engine pass.
      // `setSituation` is called once — all subsequent evaluate() calls benefit from the publicodes internal cache.
      engine = await getEngine(job.simulation.model)
      engine.setSituation(job.simulation.situation)
      await assessActions(engine, job.simulation.id)
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
    } finally {
      // The registry keeps engines alive across jobs, so the evaluation cache
      // built above would be retained until this engine's next job — forever,
      // for a hot engine left idle. Nothing is lost by dropping it now: the
      // next job's `setSituation` resets that same cache before evaluating.
      // Parsed rules are held on the context, not the cache, so they survive.
      // Only safe while the worker processes jobs sequentially.
      engine?.resetCache()
    }
  }
}
