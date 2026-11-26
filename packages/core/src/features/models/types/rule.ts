/** The non-default metric: the model names it 'eau', the default 'carbone' (stored as null). */
export type Metric = 'water'

/** A model rule as the row(s) to store: one per metric. */
export interface NewRule {
  /** Dotted name, a plain string: may be a rule of any model version. */
  name: string
  /** The model's `public: oui` mark: part of the model's output contract. */
  public: boolean
  /** The model's French `titre` and `description`, persisted for 3rd party tools. */
  title: string | null
  description: string | null
  /** The model's `empreinte eau: oui` mark: the rule also gets a water-metric evaluation. */
  appliesToWaterMetric: boolean
}

/**
 * A stored rule, identified by (name, water mark) and never renamed across model
 * versions: an `empreinte eau: oui` rule is two rows sharing the name, each with
 * its own evaluations.
 */
export interface Rule {
  id: number
  name: string
  /** The persisted `public: oui` mark. */
  public: boolean
  appliesToWaterMetric: boolean
  // No `title`/`description`: the wording is for 3rd party db syncs, not the entity.
}
