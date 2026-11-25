import type { Result } from '../../../lib/result.ts'
import type { RuleEvaluationError } from '../errors.ts'
import type { Metric } from './rule.ts'

/** The value of an applicable rule, its type read from the value itself. */
export type RuleValue = number | boolean | string

/**
 * `undefined`: not defined for the situation. A `false` value is an applicable
 * rule saying "no" — never a non-applicable one.
 */
export type Applicability =
  | { applicable: true; value: RuleValue }
  | { applicable: false }
  | { applicable: undefined }

/** Read-side evaluation: missing variables live on links, so reads need no join. */
export type RuleEvaluation = {
  name: string
  metric: Metric | null
  simulationId: string
  createdAt: Date
} & Applicability

/** Write-side evaluation, carrying the reported missing variables (stored as links). */
export type NewRuleEvaluation = RuleEvaluation & {
  /** Rules the situation does not answer and the evaluation needed */
  missingVariables: {
    name: string
    /** How many times this rule was needed */
    weight: number
  }[]
}

export type NewRuleEvaluationResult = Result<
  NewRuleEvaluation,
  RuleEvaluationError
>
