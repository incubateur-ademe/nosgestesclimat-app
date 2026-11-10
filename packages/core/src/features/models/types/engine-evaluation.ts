import type { Result } from '../../../lib/result.ts'
import type { RuleEvaluationError } from '../errors.ts'

/**
 * How a rule applies, as Publicodes says it. A value exists if and only if the
 * rule is applicable; `applicable: undefined` means the rule is not defined
 * for the situation.
 */
export type RuleApplicability =
  | { applicable: true; value: number }
  | { applicable: false }
  | { applicable: undefined }

/**
 * How the engine evaluated a rule: its applicability, or why it has none.
 */
export type EngineEvaluation = Result<RuleApplicability, RuleEvaluationError>
