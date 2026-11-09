/**
 * How the engine evaluated a rule: a value to store, mapped to `Applicability`,
 * or one that cannot be stored, described by `nodeValue` (its type, or its
 * value for NaN and ±Infinity).
 */
export type EngineEvaluation<Applicability> =
  | { outcome: 'evaluated'; applicability: Applicability }
  | { outcome: 'unexpected_node_value'; nodeValue: string }
