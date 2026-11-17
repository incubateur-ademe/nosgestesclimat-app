/** What a footprint measures. The model names them `carbone` and `eau`. */
export type Metric = 'carbon' | 'water'

/** The metrics every public rule is evaluated and stored for. */
export const PUBLIC_RULE_METRICS: readonly Metric[] = ['carbon', 'water']

/**
 * A rule of the model. `title` and `description` are the model's French
 * `titre` and `description`, persisted for readability in 3rd party tools.
 */
export interface ModelRule {
  /** Dotted name, a plain string: it may be a rule of any model version. */
  name: string
  title: string | null
  description: string | null
}

/** A model rule to store for one metric. */
export interface NewRule extends ModelRule {
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
