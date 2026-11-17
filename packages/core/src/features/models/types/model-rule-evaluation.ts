import type { Result } from '../../../lib/result.ts'
import type { RuleEvaluationError } from '../errors.ts'
import type { Metric } from './rule.ts'

/** The value of an applicable rule, its type read from the value itself. */
export type ModelRuleValue = number | boolean | string

/**
 * A rule's applicability, in Publicodes' terms: `applicable: undefined` means
 * the rule is not defined for the situation. A `false` value is an applicable
 * rule saying "no", never a not applicable one.
 */
export type Applicability =
  | { applicable: true; value: ModelRuleValue }
  | { applicable: false }
  | { applicable: undefined }

/**
 * A rule of the model evaluated for a metric, with the missing variables the
 * engine reported for that same evaluation: the rules the situation does not
 * answer that it needed, each with a weight counting how many times it needed
 * it. They are reported, never evaluated: each is a rule evaluation of its
 * own, under the same metric.
 */
export type ModelRuleEvaluation = {
  name: string
  metric: Metric
  missingVariables: { name: string; weight: number }[]
} & Applicability

export type ModelRuleEvaluationResult = Result<
  ModelRuleEvaluation,
  RuleEvaluationError
>
