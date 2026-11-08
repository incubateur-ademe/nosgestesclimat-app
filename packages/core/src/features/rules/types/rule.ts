/** What a public rule is evaluated for, named as the model names it. */
export type Metric = 'carbone' | 'eau'

/** The metrics every public rule is evaluated and stored for. */
export const PUBLIC_RULE_METRICS: readonly Metric[] = ['carbone', 'eau']

/**
 * A rule of the model carrying `public: oui`: part of the model's output
 * contract, whose evaluations are stored. `title` and `description` are the
 * model's French `titre` and `description`.
 */
export interface PublicRule {
  name: string
  title: string | null
  description: string | null
}

/** A public rule to store for one metric. */
export interface NewRule extends PublicRule {
  metric: Metric
}

/**
 * A stored public rule, identified by its name and metric. The name is its
 * identity across model versions: a stored rule is never renamed.
 */
export interface Rule {
  id: number
  name: string
  metric: Metric
}

/**
 * The value of one Rule for one simulation. A value exists if and only if the
 * rule is applicable; `applicable: null` means the rule is not defined for the
 * simulation.
 */
export type RuleApplicability =
  | { applicable: true; value: number }
  | { applicable: false }
  | { applicable: null }

/**
 * How a public rule evaluated for a metric: a value to store, or one that
 * cannot be (`true`, a string, NaN or ±Infinity), described by `nodeValue`.
 */
export type PublicRuleEvaluation =
  | { outcome: 'evaluated'; applicability: RuleApplicability }
  | { outcome: 'unexpected_node_value'; nodeValue: string }

export type NewRuleEvaluation = {
  simulationId: string
  ruleId: number
} & RuleApplicability
