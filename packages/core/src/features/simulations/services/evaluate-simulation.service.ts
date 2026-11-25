import type Engine from 'publicodes'
import { failure, success, type Result } from '../../../lib/result.ts'
import type { Transaction } from '../../../lib/transaction.ts'
import type { Logger } from '../../logger/index.ts'
import { evaluateModelRules } from '../../models/helpers/evaluate-model-rules.ts'
import { getModelRule } from '../../models/helpers/model-rules.ts'
import { upsertRules } from '../../models/repositories/rules.repository.ts'
import type { NewRule, Rule } from '../../models/types/rule.ts'
import { PublicRulesEvaluationError } from '../errors/simulations.error.ts'
import { createRuleEvaluations } from '../repository/rule-evaluations.repository.ts'

interface EvaluateSimulationDeps {
  logger: Logger
}

/**
 * Evaluates the given public rules of the simulation's model and persists the
 * evaluations. `publicRules` holds the stored rule rows: one per rule for the
 * default metric, plus the water row of each rule stored with
 * `appliesToWaterMetric` (the model's `empreinte eau: oui`) — each row is
 * evaluated with its own metric's context and gets its own evaluation.
 *
 * The missing variables each evaluation reports are not evaluated and get no
 * evaluation row: only their rule row and the link carrying their weight are
 * stored.
 *
 * The engine's situation must already be set to the simulation's. Writes go
 * through `session`, for the caller to commit them with its own; the rule rows
 * written here are resolved in the same transaction, so a rollback leaves no
 * orphan behind.
 *
 * A simulation's evaluations are stored whole or not at all. Each rule that
 * fails is logged here: the returned failure only counts them.
 */
export function createEvaluateSimulation(deps: EvaluateSimulationDeps) {
  return async function evaluateSimulation(
    engine: Engine,
    simulationId: string,
    publicRules: Rule[],
    { session }: { session: Transaction }
  ): Promise<Result<void, PublicRulesEvaluationError>> {
    const logger = deps.logger.child({
      scope: 'core.service.evaluateSimulation',
      simulationId,
    })

    const createdAt = new Date()

    const { evaluations, errors } = evaluateModelRules({
      engine,
      rules: publicRules,
      simulationId,
      createdAt,
    })

    if (errors.length > 0) {
      errors.forEach((error) => logger.error(error))
      return failure(new PublicRulesEvaluationError(errors.length))
    }

    // The rule rows to store next to the public ones: those of each missing
    // variable reported, whatever the metric of the evaluation that reported
    // it — a missing variable is not evaluated, and most rules are not
    // specific to a metric.
    const seen = new Set(publicRules.map((rule) => rule.name))
    const newRules: NewRule[] = []
    for (const evaluation of evaluations) {
      for (const missingVariable of evaluation.missingVariables) {
        if (!seen.has(missingVariable.name)) {
          seen.add(missingVariable.name)
          newRules.push(...getModelRule(engine, missingVariable.name))
        }
      }
    }

    if (newRules.length > 0) {
      logger.info('Upserting rules', {
        rules: newRules.map(({ name }) => ({ name })),
      })
    }

    const storedNewRules = await upsertRules(newRules, { session })

    if (evaluations.length > 0) {
      await createRuleEvaluations(
        evaluations,
        [...publicRules, ...storedNewRules],
        { session }
      )
    }

    return success()
  }
}
