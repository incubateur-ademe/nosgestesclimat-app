import type { RuleApplicability } from '../../models/types/engine-evaluation.ts'

/**
 * The value of one Rule for one simulation, as the engine evaluated it: a
 * value exists if and only if the rule is applicable; `applicable: undefined`
 * means the rule is not defined for the simulation.
 */
export type NewRuleEvaluation = {
  simulationId: string
  ruleId: number
} & RuleApplicability
