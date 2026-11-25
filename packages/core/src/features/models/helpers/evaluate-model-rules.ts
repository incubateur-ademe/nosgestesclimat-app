import type Engine from 'publicodes'
import type { RuleEvaluationError } from '../errors.ts'
import type { NewRuleEvaluation } from '../types/rule-evaluation.ts'
import { evaluateModelRule } from './evaluate-model-rule.ts'

/**
 * Evaluates `rules`, each under its own metric: the water one when the rule is
 * marked `appliesToWaterMetric`, the default one otherwise. The missing
 * variables each evaluation reports are left on it, not evaluated: only the
 * given rules get an evaluation.
 *
 * A rule that fails does not stop the others: every error is returned, and the
 * missing variables of a failed rule are not known.
 */
export const evaluateModelRules = ({
  engine,
  rules,
  simulationId,
  createdAt,
}: {
  engine: Engine
  rules: { name: string; appliesToWaterMetric?: boolean }[]
  simulationId: string
  createdAt: Date
}): { evaluations: NewRuleEvaluation[]; errors: RuleEvaluationError[] } => {
  const evaluations: NewRuleEvaluation[] = []
  const errors: RuleEvaluationError[] = []

  for (const { name, appliesToWaterMetric = false } of rules) {
    const evaluation = evaluateModelRule({
      engine,
      dottedName: name,
      simulationId,
      createdAt,
      metric: appliesToWaterMetric ? 'water' : null,
    })
    if (!evaluation.success) {
      errors.push(evaluation.error)
      continue
    }
    evaluations.push(evaluation.data)
  }

  return { evaluations, errors }
}
