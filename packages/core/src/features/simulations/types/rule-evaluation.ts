import type { ModelRuleEvaluation } from '../../models/types/model-rule-evaluation.ts'

/** The value of one Rule for one simulation. */
export type NewRuleEvaluation = {
  simulationId: string
  ruleId: number
} & ModelRuleEvaluation

/** A stored rule evaluation. */
export type RuleEvaluation = {
  simulationId: string
  ruleId: number
  createdAt: Date
} & ModelRuleEvaluation
