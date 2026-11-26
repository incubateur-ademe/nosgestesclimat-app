import type Engine from 'publicodes'
import type { RuleEvaluationError } from '../errors.ts'
import type { NewRuleEvaluation } from '../types/rule-evaluation.ts'
import { evaluateModelRule } from './evaluate-model-rule.ts'

/**
 * Each rule under its own metric (water when `appliesToWaterMetric`); a failed
 * rule is collected in `errors` without stopping the others.
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
      ruleName: name,
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
