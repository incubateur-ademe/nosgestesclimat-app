import type Engine from 'publicodes'
import { failure, success, type Result } from '../../../lib/result.ts'
import { transaction, type Transaction } from '../../../lib/transaction.ts'
import type { ActionAssessmentPublicodesError } from '../../actions/errors/action-assessment.error.ts'
import { serializeModel } from '../../models/helpers/model-versions.ts'
import type { Model } from '../../models/types/model.ts'
import type { Rule } from '../../models/types/rule.ts'
import type { PublicRulesEvaluationError } from '../../simulations/errors/simulations.error.ts'
import type { Simulation } from '../../simulations/types/simulation.ts'
import { SimulationComputationFailedError } from '../errors/simulation-computation.error.ts'
import {
  claimNextPendingSimulationComputation,
  markSimulationComputationCompleted,
  markSimulationComputationFailed,
} from '../repositories/simulation-computations.repository.ts'

/**
 * Writes through `session` only, and nothing when it fails. Idempotent, so a
 * retried job keeps the assessments of its first attempt.
 */
export type AssessActions = (
  engine: Engine,
  simulationId: string,
  options: { session: Transaction }
) => Promise<Result<void, ActionAssessmentPublicodesError>>

/**
 * Writes through `session` only, and nothing when it fails. Logs each rule it
 * fails on.
 */
export type EvaluateSimulation = (
  engine: Engine,
  simulationId: string,
  publicRules: Rule[],
  options: { session: Transaction }
) => Promise<Result<void, PublicRulesEvaluationError>>

/**
 * Must commit its writes on its own: the rules it resolves outlive a rolled
 * back job.
 */
export type ResolvePublicRules = (
  engine: Engine,
  model: Model
) => Promise<Rule[]>

interface ProcessNextPendingComputationDeps {
  assessActions: AssessActions
  evaluateSimulation: EvaluateSimulation
  resolvePublicRules: ResolvePublicRules
}

const failComputation = async (
  simulation: Simulation,
  cause: unknown
): Promise<Result<never, SimulationComputationFailedError>> => {
  const fail = (failureCause: unknown) =>
    failure(
      new SimulationComputationFailedError({
        simulationId: simulation.id,
        model: serializeModel(simulation.model),
        cause: failureCause,
      })
    )

  try {
    await markSimulationComputationFailed(simulation.id)
  } catch (cleanupError) {
    return fail(new SuppressedError(cleanupError, cause))
  }
  return fail(cause)
}

/**
 * Entry point called by the worker in a loop.
 *
 * A job completes with all of its simulation's rule evaluations, or fails
 * with none. The action assessments are committed apart: they survive a failed
 * job, which a retry does not assess again.
 *
 * Returns `success(true)` when a job was processed, `success(false)` when the
 * queue was empty, and a failure otherwise, for the worker to report.
 */
export function createProcessNextPendingComputation(
  deps: ProcessNextPendingComputationDeps
) {
  const { assessActions, evaluateSimulation, resolvePublicRules } = deps
  return async function processNextPendingComputation(
    getEngine: (model: Model) => Promise<Engine> | Engine
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
      let computed: Result<void, PublicRulesEvaluationError>
      try {
        engine.setSituation(situation)
        // Outside the transaction: the resolver caches the ids of the rules it
        // stores, which a rollback must not take away.
        const publicRules = await resolvePublicRules(engine, model)
        // Committed apart, so a failed evaluation does not take them away.
        const assessed = await transaction((session) =>
          assessActions(engine, id, { session })
        )
        // Nothing to evaluate the simulation for: the actions are part of it.
        if (!assessed.success) {
          return failComputation(job.simulation, assessed.error)
        }
        // A reclaimed job whose earlier attempt crashed left no evaluation
        // behind: they were never committed.
        computed = await transaction(async (session) => {
          const evaluated = await evaluateSimulation(engine, id, publicRules, {
            session,
          })
          if (!evaluated.success) {
            return evaluated
          }
          await markSimulationComputationCompleted(id, { session })
          return success()
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
      if (!computed.success) {
        return failComputation(job.simulation, computed.error)
      }
      return success(true)
    } catch (error) {
      return failComputation(job.simulation, error)
    }
  }
}
