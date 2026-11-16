import type { Result } from '../../../lib/result.ts'
import type { RuleEvaluationError } from '../errors.ts'

/**
 * A rule's applicability, in Publicodes' terms: `applicable: undefined` means
 * the rule is not defined for the situation.
 */
export type ModelRuleEvaluation =
  | { applicable: true; value: number }
  | { applicable: false }
  | { applicable: undefined }

export type ModelRuleEvaluationResult = Result<
  ModelRuleEvaluation,
  RuleEvaluationError
>
