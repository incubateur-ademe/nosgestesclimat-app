import type { ModelRuleEvaluation } from '../../models/types/model-rule-evaluation.ts'

/** The value of one Rule for one simulation. */
export type NewRuleEvaluation = {
  simulationId: string
  ruleId: number
} & ModelRuleEvaluation
