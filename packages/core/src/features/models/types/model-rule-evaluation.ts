import type { Result } from '../../../lib/result.ts'
import type { RuleEvaluationError } from '../errors.ts'

/** The value of an applicable rule, its type read from the value itself. */
export type ModelRuleValue = number | boolean | string

/**
 * A rule's applicability, in Publicodes' terms: `applicable: undefined` means
 * the rule is not defined for the situation. A `false` value is an applicable
 * rule saying "no", never a not applicable one.
 */
export type ModelRuleEvaluation =
  | { applicable: true; value: ModelRuleValue }
  | { applicable: false }
  | { applicable: undefined }

export type ModelRuleEvaluationResult = Result<
  ModelRuleEvaluation,
  RuleEvaluationError
>
