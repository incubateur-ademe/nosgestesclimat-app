import type Engine from 'publicodes'
import { failure, success, type Result } from '../../../lib/result.ts'
import type { Transaction } from '../../../lib/transaction.ts'
import type { Logger } from '../../logger/index.ts'
import { evaluateModelRulesAndTheirMissingVariables } from '../../models/helpers/evaluate-model-rules-and-their-missing-variables.ts'
import { getModelRule } from '../../models/helpers/model-rules.ts'
import { ruleKey } from '../../models/helpers/rule-key.ts'
import { upsertRules } from '../../models/repositories/rules.repository.ts'
import type { Rule } from '../../models/types/rule.ts'
import { PublicRulesEvaluationError } from '../errors/simulations.error.ts'
import { createRuleEvaluations } from '../repository/rule-evaluations.repository.ts'

interface EvaluateSimulationDeps {
  logger: Logger
}

/**
 * Evaluates the given public rules of the simulation's model, each for its
 * metric, and persists the evaluations.
 *
 * The missing variables each public rule reports are evaluated and stored
 * too, linked to the evaluations that reported them; their own are not.
 *
 * The engine's situation must already be set to the simulation's. Writes go
 * through `session`, for the caller to commit them with its own; the missing
 * variables' rule rows are resolved in the same transaction, so a rollback
 * leaves no orphan behind.
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
    const { evaluations, errors } = evaluateModelRulesAndTheirMissingVariables({
      engine,
      rules: publicRules,
      simulationId,
      createdAt,
    })

    if (errors.length > 0) {
      errors.forEach((error) => logger.error(error))
      return failure(new PublicRulesEvaluationError(errors.length))
    }

    const publicRuleSet = new Set(
      publicRules.map(({ name, metric }) => ruleKey(metric, name))
    )
    const missing = evaluations.filter(
      ({ name, metric }) => !publicRuleSet.has(ruleKey(metric, name))
    )

    if (missing.length > 0) {
      logger.info('Upserting rules', {
        rules: missing.map(({ name, metric }) => ({ name, metric })),
      })
    }

    const missingRules = await upsertRules(
      missing.map(({ name, metric }) => ({
        metric,
        ...getModelRule(engine, name),
      })),
      { session }
    )

    if (evaluations.length > 0) {
      await createRuleEvaluations(
        evaluations,
        [...publicRules, ...missingRules],
        { session }
      )
    }

    return success()
  }
}
