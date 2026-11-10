import type Engine from 'publicodes'
import { failure, success, type Result } from '../../../lib/result.ts'
import type { Transaction } from '../../../lib/transaction.ts'
import type { RuleEvaluationError } from '../../models/errors.ts'
import { evaluatePublicRule } from '../../models/helpers/evaluate-public-rule.ts'
import type { Rule } from '../../models/types/rule.ts'
import { PublicRulesEvaluationError } from '../errors/simulations.error.ts'
import { createRuleEvaluations } from '../repository/rule-evaluations.repository.ts'
import type { NewRuleEvaluation } from '../types/rule-evaluation.ts'

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
 * written and every such rule is listed in the failure, for the caller to
 * report.
 */
export async function evaluateSimulation(
  engine: Engine,
  simulationId: string,
  publicRules: Rule[],
  { session }: { session: Transaction }
): Promise<Result<void, PublicRulesEvaluationError>> {
  const evaluations: NewRuleEvaluation[] = []
  const errors: RuleEvaluationError[] = []

  for (const { id, name, metric } of publicRules) {
    const evaluation = evaluatePublicRule({ engine, dottedName: name, metric })

    if (evaluation.success) {
      evaluations.push({ simulationId, ruleId: id, ...evaluation.data })
    } else {
      errors.push(evaluation.error)
    }
  }

  if (errors.length > 0) {
    return failure(new PublicRulesEvaluationError(errors))
  }

  if (evaluations.length > 0) {
    await createRuleEvaluations(evaluations, { session })
  }

  return success()
}
