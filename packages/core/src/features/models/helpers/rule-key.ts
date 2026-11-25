import type { Metric, Rule } from '../types/rule.ts'

/** The key of an evaluation: the rule's name, suffixed with its metric when it has one. */
export const ruleKey = (name: string, metric?: Metric | null) =>
  metric == null ? name : `${name} :: ${metric}`

/** The stored rules' ids by evaluation key: a water-marked rule has two rows sharing its name. */
export const ruleIdByKey = (rules: Rule[]): Map<string, number> =>
  new Map(
    rules.map(({ id, name, appliesToWaterMetric }) => [
      ruleKey(name, appliesToWaterMetric ? 'water' : null),
      id,
    ])
  )

/** Throws when no stored rule matches the name and metric. */
export const ruleIdOf = (
  ruleIdByKey: Map<string, number>,
  name: string,
  metric?: Metric | null
): number => {
  const id = ruleIdByKey.get(ruleKey(name, metric))
  if (id === undefined) {
    throw new Error(
      `Invariant: no rule found for "${name}" (${metric ?? 'carbon'})`
    )
  }
  return id
}

/** The id of a missing variable's rule row: its metric's row when stored, else the default one. */
export const missingVariableRuleIdOf = (
  ruleIdByKey: Map<string, number>,
  name: string,
  metric?: Metric | null
): number =>
  ruleIdByKey.get(ruleKey(name, metric)) ?? ruleIdOf(ruleIdByKey, name)
