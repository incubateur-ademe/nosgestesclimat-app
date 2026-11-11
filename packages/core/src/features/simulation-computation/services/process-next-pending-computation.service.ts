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
 * Assesses every action against the simulation the engine is situated in,
 * writing through `session` only. Idempotent: writes nothing for a simulation
 * already assessed, so a retried job keeps the assessments of its first
 * attempt. Writes nothing and fails when the actions cannot be linked to the
 * model's rules.
 */
export type AssessActions = (
  engine: Engine,
  simulationId: string,
  options: { session: Transaction }
) => Promise<Result<void, ActionAssessmentPublicodesError>>

/**
 * Evaluates the given public rules against the simulation the engine is
 * situated in, writing through `session` only. Writes nothing and fails when
 * a rule cannot be evaluated, having reported each such rule.
 */
export type EvaluateSimulation = (
  engine: Engine,
  simulationId: string,
  publicRules: Rule[],
  options: { session: Transaction }
) => Promise<Result<void, PublicRulesEvaluationError>>

/**
 * Resolves the stored `Rule` of each public rule of the model, for each
 * metric. Its writes must be committed on their own: the rules are resolved
 * outside the job's transaction, so a rolled back job keeps them.
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

/**
 * Marks the simulation's job failed, failing with the `cause`, the failure of
 * the marking added to it.
 */
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
 * Claims the next pending SimulationComputation job, resolves the engine
 * matching the job's model, then assesses the actions and evaluates the
 * model's public rules against the simulation. The action assessments are
 * committed on their own, and kept whatever happens next: a retried job does
 * not assess them again. When the actions cannot be assessed, the job is
 * marked failed without evaluating the simulation. The rule evaluations and
 * the `completed` status are then committed in one transaction: on error, or
 * when a public rule cannot be evaluated, they are rolled back and the job is
 * marked failed. The model's public rules are resolved before that
 * transaction, their `Rule` rows committed on their own.
 *
 * Returns `success(true)` when a job was processed, `success(false)` when the
 * queue was empty, and a failure otherwise, for the worker to report: nothing
 * is reported here. The public rules that cannot be evaluated are reported by
 * `evaluateSimulation`, and only counted by the failure's `cause`.
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
        // Committed apart from the evaluations, so a failed evaluation does not
        // take them away. A retried job finds them and skips the assessment.
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
          // A computed simulation has all of its evaluations: none is kept
          // when one of them fails.
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
