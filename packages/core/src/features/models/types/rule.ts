/** What a footprint measures. The model names them `carbone` and `eau`. */
export type Metric = 'carbon' | 'water'

/** The metrics every footprint rule is evaluated and stored for. */
export const FOOTPRINT_RULE_METRICS: readonly Metric[] = ['carbon', 'water']

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

/**
 * A public rule to store, for one metric. `metric` is null for the rules the
 * model computes without one.
 */
export interface NewRule extends PublicRule {
  metric: Metric | null
}

/**
 * A stored public rule, identified by its name and metric. The name is its
 * identity across model versions: a stored rule is never renamed.
 */
export interface Rule {
  id: number
  name: string
  metric: Metric | null
}
