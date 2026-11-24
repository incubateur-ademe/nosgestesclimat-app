import type { Metric, Rule } from '../types/rule.ts'

/**
 * The key of a rule by metric and name, used to dedupe rules and match their
 * evaluations by pair.
 */
export const ruleKey = (metric: Metric, name: string) => `${metric}:${name}`

/**
 * The stored rules' ids by rule key, to resolve a rule's id from its name and
 * metric: the id is written here and read back through the rule, never exposed
 * on an evaluation.
 */
export const ruleIdByRuleKey = (rules: Rule[]): Map<string, number> =>
  new Map(rules.map(({ id, name, metric }) => [ruleKey(metric, name), id]))

/** Throws when no stored rule matches the name and metric. */
export const ruleIdOf = (
  ruleIdByKey: Map<string, number>,
  metric: Metric,
  name: string
): number => {
  const id = ruleIdByKey.get(ruleKey(metric, name))
  if (id === undefined) {
    throw new Error(
      `Invariant: no rule found for evaluation "${ruleKey(metric, name)}"`
    )
  }
  return id
}
