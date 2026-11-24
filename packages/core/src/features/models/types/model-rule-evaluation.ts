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
 * A rule of the model evaluated for a given metric and simulation.
 */
export type ModelRuleEvaluation = {
  name: string
  metric: Metric
  /** The rules the situation does not answer and that an evaluation needed */
  missingVariables: {
    name: string
    /** How many times this rule was needed */
    weight: number
  }[]
  simulationId: string
  createdAt: Date
} & Applicability

export type ModelRuleEvaluationResult = Result<
  ModelRuleEvaluation,
  RuleEvaluationError
>
