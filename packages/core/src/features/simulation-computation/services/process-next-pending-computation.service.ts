import type Engine from 'publicodes'
import { failure, success, type Result } from '../../../lib/result.ts'
import { transaction } from '../../../lib/transaction.ts'
import { serializeModel } from '../../models/helpers/model-versions.ts'
import type { ResolvePublicRules } from '../../rules/services/resolve-public-rules.service.ts'
import type {
  EvaluateSimulation,
  SimulationToEvaluate,
} from '../../simulations/services/evaluate-simulation.service.ts'
import type { Simulation } from '../../simulations/types/simulation.ts'
import { SimulationComputationFailedError } from '../errors/simulation-computation.error.ts'
import {
  claimNextPendingSimulationComputation,
  markSimulationComputationCompleted,
  markSimulationComputationFailed,
} from '../repositories/simulation-computations.repository.ts'

interface ProcessNextPendingComputationDeps {
  evaluateSimulation: EvaluateSimulation
  resolvePublicRules: ResolvePublicRules
}

/**
 * Entry point called by the worker in a loop.
 *
 * Claims the next pending SimulationComputation job, resolves the engine
 * matching the job's model and evaluates the simulation with it. The
 * evaluation's writes and the `completed` status are committed in one
 * transaction: on error they are rolled back and the job is marked failed.
 * The model's public rules are resolved before that transaction, their `Rule`
 * rows committed on their own.
 *
 * Returns `success(true)` when a job was processed, `success(false)` when the
 * queue was empty, and a failure otherwise.
 */
export function createProcessNextPendingComputation(
  deps: ProcessNextPendingComputationDeps
) {
  const { evaluateSimulation, resolvePublicRules } = deps
  return async function processNextPendingComputation(
    getEngine: (model: Simulation['model']) => Promise<Engine> | Engine
  ): Promise<Result<boolean, SimulationComputationFailedError>> {
    const job = await claimNextPendingSimulationComputation()
    if (!job) {
      return success(false)
    }
    try {
      // Computes all data derived from a simulation in a single engine pass.
      // `setSituation` is called once — all subsequent evaluate() calls benefit from the publicodes internal cache.
      const { id, model, situation } = job.simulation
      const engine = await getEngine(model)
      try {
        engine.setSituation(situation)
        const simulation: SimulationToEvaluate = {
          id,
          model: serializeModel(model),
        }
        // Outside the transaction: the resolver caches the ids of the rules it
        // stores, which a rollback must not take away.
        const publicRules = await resolvePublicRules(engine, simulation.model)
        // A reclaimed job whose earlier attempt crashed left nothing behind:
        // its writes were never committed.
        await transaction(async (session) => {
          await evaluateSimulation(engine, simulation, { session, publicRules })
          await markSimulationComputationCompleted(id, { session })
        })
      } finally {
        // The registry keeps engines alive across jobs, so the evaluation
        // cache built above would be retained until this engine's next job —
        // forever, for a hot engine left idle. Nothing is lost by dropping it
        // now: the next job's `setSituation` resets that same cache before
        // evaluating. Parsed rules are held on the context, not the cache, so
        // they survive. Only safe while the worker processes jobs sequentially.
        engine.resetCache()
      }
      return success(true)
    } catch (error) {
      try {
        await markSimulationComputationFailed(job.simulation.id)
      } catch (cleanupError) {
        return failure(
          new SimulationComputationFailedError({
            simulationId: job.simulation.id,
            cause: new SuppressedError(cleanupError, error),
          })
        )
      }
      return failure(
        new SimulationComputationFailedError({
          simulationId: job.simulation.id,
          cause: error,
        })
      )
    }
  }
}
