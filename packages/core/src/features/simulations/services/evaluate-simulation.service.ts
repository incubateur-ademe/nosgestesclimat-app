import type Engine from 'publicodes'
import { failure, success, type Result } from '../../../lib/result.ts'
import type { Transaction } from '../../../lib/transaction.ts'
import type { Logger } from '../../logger/index.ts'
import {
  evaluateModelRule,
  requireFiniteValue,
} from '../../models/helpers/evaluate-model-rule.ts'
import type { Rule } from '../../models/types/rule.ts'
import { PublicRulesEvaluationError } from '../errors/simulations.error.ts'
import { createRuleEvaluations } from '../repository/rule-evaluations.repository.ts'
import type { NewRuleEvaluation } from '../types/rule-evaluation.ts'

interface EvaluateSimulationDeps {
  logger: Logger
}

/**
 * Evaluates the given public rules of the simulation's model, each for its
 * metric, and persists the evaluations.
 *
 * The engine's situation must already be set to the simulation's. Every rule
 * is evaluated before anything is written, and every write goes through
 * `session`, so the caller commits them together with its own writes, or rolls
 * them all back.
 *
 * A simulation's evaluations are stored whole or not at all: when a rule's
 * evaluation throws, or yields a value that cannot be stored, nothing is
 * written. Each such rule is reported here, one error per rule and metric, and
 * the failure only counts them.
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
    const evaluations: NewRuleEvaluation[] = []
    let failedCount = 0

    for (const { id, name, metric } of publicRules) {
      const evaluation = requireFiniteValue(
        evaluateModelRule({ engine, dottedName: name, metric }),
        { dottedName: name, metric }
      )

      if (evaluation.success) {
        evaluations.push({ simulationId, ruleId: id, ...evaluation.data })
      } else {
        logger.error(evaluation.error)
        failedCount++
      }
    }

    if (failedCount > 0) {
      return failure(new PublicRulesEvaluationError(failedCount))
    }

    if (evaluations.length > 0) {
      await createRuleEvaluations(evaluations, { session })
    }

    return success()
  }
}
