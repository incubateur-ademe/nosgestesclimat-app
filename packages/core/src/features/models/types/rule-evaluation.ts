import type { Result } from '../../../lib/result.ts'
import type { RuleEvaluationError } from '../errors.ts'
import type { Metric } from './rule.ts'

/** The value of an applicable rule, its type read from the value itself. */
export type RuleValue = number | boolean | string

/**
 * A rule's applicability, in Publicodes' terms: `applicable: undefined` means
 * the rule is not defined for the situation. A `false` value is an applicable
 * rule saying "no", never a not applicable one.
 */
export type Applicability =
  | { applicable: true; value: RuleValue }
  | { applicable: false }
  | { applicable: undefined }

/**
 * A rule of the model evaluated for a given metric and simulation, as read
 * back: without its missing variables, so reads need no join on them.
 */
export type RuleEvaluation = {
  name: string
  metric: Metric | null
  simulationId: string
  createdAt: Date
} & Applicability

/**
 * A rule evaluation to write, with the missing variables it reported. Only
 * the write side carries them: they are stored as links, not on the evaluation.
 */
export type NewRuleEvaluation = RuleEvaluation & {
  /** The rules the situation does not answer and that an evaluation needed */
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
