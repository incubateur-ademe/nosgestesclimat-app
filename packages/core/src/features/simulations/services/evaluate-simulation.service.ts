import type Engine from 'publicodes'
import type { Transaction } from '../../../lib/transaction.ts'
import type { Logger } from '../../logger/index.ts'
import { UnexpectedNodeValueError } from '../../models/errors.ts'
import { evaluatePublicRule } from '../../models/helpers/evaluate-public-rule.ts'
import type { Rule } from '../../models/types/rule.ts'
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
 * A rule whose evaluation throws, or yields a value that cannot be stored, is
 * skipped with a warning: it never fails the simulation, and the model's
 * mistake is found in the logs.
 */
export function createEvaluateSimulation(deps: EvaluateSimulationDeps) {
  return async function evaluateSimulation(
    engine: Engine,
    simulationId: string,
    publicRules: Rule[],
    { session }: { session: Transaction }
  ): Promise<void> {
    const logger = deps.logger.child({
      scope: 'core.service.evaluateSimulation',
      simulationId,
    })

    const evaluations: NewRuleEvaluation[] = publicRules.flatMap(
      ({ id, name, metric }) => {
        const evaluation = evaluatePublicRule({
          engine,
          dottedName: name,
          metric,
        })

        if (!evaluation.success) {
          const meta = { dottedName: name, metric }
          if (evaluation.error instanceof UnexpectedNodeValueError) {
            logger.warn(evaluation.error.message, meta)
          } else {
            logger.warn(evaluation.error, meta)
          }
          return []
        }

        return [{ simulationId, ruleId: id, ...evaluation.data }]
      }
    )

    if (evaluations.length > 0) {
      await createRuleEvaluations(evaluations, { session })
    }
  }
}
