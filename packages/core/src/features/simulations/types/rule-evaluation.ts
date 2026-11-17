import type { Applicability } from '../../models/types/model-rule-evaluation.ts'

/**
 * The value of one Rule for one simulation, with the missing variables it
 * reported: each one a rule evaluation of the same simulation, written
 * alongside it.
 */
export type NewRuleEvaluation = {
  simulationId: string
  ruleId: number
} & Applicability & {
    missingVariables: { ruleId: number; weight: number }[]
  }

/** A stored rule evaluation. */
export type RuleEvaluation = {
  simulationId: string
  ruleId: number
  createdAt: Date
} & Applicability

/**
 * A missing variable of a rule evaluation: the rule evaluation of the missing
 * variable, `weight` counting how many times the engine needed it.
 */
export type RuleEvaluationMissingVariable = RuleEvaluation & { weight: number }

/** A stored rule evaluation with the missing variables it reported. */
export type DetailedRuleEvaluation = RuleEvaluation & {
  missingVariables: RuleEvaluationMissingVariable[]
}
