import type { Prisma } from '../../../prisma/generated/client.ts'
import type { NewRuleEvaluation } from '../types/rule-evaluation.ts'

export const mapNewRuleEvaluationToPrisma = (
  evaluation: NewRuleEvaluation
): Prisma.RuleEvaluationCreateManyInput => ({
  simulationId: evaluation.simulationId,
  ruleId: evaluation.ruleId,
  applicable: evaluation.applicable ?? null,
  valueNumber: evaluation.applicable === true ? evaluation.value : null,
})
