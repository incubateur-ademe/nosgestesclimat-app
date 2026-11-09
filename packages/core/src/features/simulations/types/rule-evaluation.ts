/**
 * The value of one Rule for one simulation. A value exists if and only if the
 * rule is applicable; `applicable: null` means the rule is not defined for the
 * simulation.
 */
export type RuleApplicability =
  | { applicable: true; value: number }
  | { applicable: false }
  | { applicable: null }

export type NewRuleEvaluation = {
  simulationId: string
  ruleId: number
} & RuleApplicability
