/**
 * A metric beyond the default one, which the model names `carbone`. The model
 * names `water` `eau`. Evaluations of the default metric have `metric: null`.
 */
export type Metric = 'water'

/**
 * A rule of the model. `title` and `description` are the model's French
 * `titre` and `description`, persisted for readability in 3rd party tools.
 * `appliesToWaterMetric` is the model's `empreinte eau: oui` mark: the rule
 * also has an evaluation with the water metric context — today under the same
 * name, in future models under its own name.
 */
export interface ModelRule {
  /** Dotted name, a plain string: it may be a rule of any model version. */
  name: string
  title: string | null
  description: string | null
  appliesToWaterMetric: boolean
}

/**
 * A stored model rule, identified by its name and water mark: a rule marked
 * `empreinte eau: oui` in the model is stored as two rows sharing the name,
 * and each row gets its own evaluations. The name is the identity across model
 * versions: a stored rule is never renamed.
 */
export interface Rule {
  id: number
  name: string
  appliesToWaterMetric: boolean
  // No `title`/`description`: the wording is persisted only for 3rd party
  // tools syncing with the db, it is not part of the entity.
}
