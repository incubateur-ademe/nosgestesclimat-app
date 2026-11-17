import type Engine from 'publicodes'
import type { RuleEvaluationError } from '../errors.ts'
import type { ModelRuleEvaluation } from '../types/model-rule-evaluation.ts'
import type { Metric, Rule } from '../types/rule.ts'
import { evaluateModelRule } from './evaluate-model-rule.ts'
import { ruleKey } from './rule-key.ts'

/**
 * Evaluates `rules`, then the missing variables they report: each missing
 * variable is evaluated once per name and metric, however many evaluations
 * report it, under the metric of the evaluation that reported it.
 *
 * The missing variables' own missing variables are reported on their
 * evaluations, never evaluated.
 *
 * A rule that fails does not stop the others: every error is returned, and the
 * missing variables of a failed rule are not known.
 */
export const evaluateModelRulesAndTheirMissingVariables = ({
  engine,
  rules,
}: {
  engine: Engine
  rules: Rule[]
}): { evaluations: ModelRuleEvaluation[]; errors: RuleEvaluationError[] } => {
  const evaluations: ModelRuleEvaluation[] = []
  const errors: RuleEvaluationError[] = []

  /** Evaluates a rule, records its evaluation or its error, returns the former. */
  const evaluate = (name: string, metric: Metric) => {
    const evaluation = evaluateModelRule({ engine, dottedName: name, metric })
    if (!evaluation.success) {
      errors.push(evaluation.error)
      return undefined
    }
    evaluations.push(evaluation.data)
    return evaluation.data
  }

  const seen = new Set(rules.map(({ name, metric }) => ruleKey(metric, name)))
  const missing: { name: string; metric: Metric }[] = []

  for (const { name, metric } of rules) {
    const evaluation = evaluate(name, metric)
    if (!evaluation) {
      continue
    }

    for (const missingVariable of evaluation.missingVariables) {
      const rule = { name: missingVariable.name, metric }
      if (!seen.has(ruleKey(rule.metric, rule.name))) {
        seen.add(ruleKey(rule.metric, rule.name))
        missing.push(rule)
      }
    }
  }

  for (const { name, metric } of missing) {
    evaluate(name, metric)
  }

  return { evaluations, errors }
}
