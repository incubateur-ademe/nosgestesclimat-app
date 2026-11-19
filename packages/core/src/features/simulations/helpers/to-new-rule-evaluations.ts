import { ruleKey } from '../../models/helpers/rule-key.ts'
import type { ModelRuleEvaluation } from '../../models/types/model-rule-evaluation.ts'
import type { Metric, Rule } from '../../models/types/rule.ts'
import type { NewRuleEvaluation } from '../types/rule-evaluation.ts'

/**
 * Maps the model's rule evaluations of a simulation to the rule evaluations to
 * store, each rule identified by its stored `Rule` of the same name and
 * metric.
 *
 * A missing variable that was not evaluated has no rule evaluation to link
 * to: its link is dropped.
 *
 * Throws when an evaluation has no stored `Rule` among `rules`.
 */
export const toNewRuleEvaluations = (
  simulationId: string,
  evaluations: ModelRuleEvaluation[],
  rules: Rule[]
): NewRuleEvaluation[] => {
  const ruleIdByKey = new Map(
    rules.map(({ id, name, metric }) => [ruleKey(metric, name), id])
  )
  const evaluated = new Set(
    evaluations.map(({ name, metric }) => ruleKey(metric, name))
  )

  return evaluations.map(
    ({ name, metric, missingVariables, ...evaluation }) => ({
      simulationId,
      ruleId: ruleIdOf(ruleIdByKey, metric, name),
      ...evaluation,
      missingVariables: missingVariables
        .filter((missing) => evaluated.has(ruleKey(metric, missing.name)))
        .map((missing) => ({
          ruleId: ruleIdOf(ruleIdByKey, metric, missing.name),
          weight: missing.weight,
        })),
    })
  )
}

const ruleIdOf = (
  ruleIdByKey: Map<string, number>,
  metric: Metric,
  name: string
): number => {
  const id = ruleIdByKey.get(ruleKey(metric, name))
  if (id === undefined) {
    throw new Error(`No stored rule for ${name} (${metric})`)
  }
  return id
}
