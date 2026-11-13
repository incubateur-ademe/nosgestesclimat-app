import type { Prisma } from '../../../prisma/generated/client.ts'
import type { RuleEvaluationModel } from '../../../prisma/generated/models/RuleEvaluation.ts'
import type {
  NewRuleEvaluation,
  RuleEvaluation,
} from '../types/rule-evaluation.ts'

export const mapNewRuleEvaluationToPrisma = (
  evaluation: NewRuleEvaluation
): Prisma.RuleEvaluationCreateManyInput => ({
  simulationId: evaluation.simulationId,
  ruleId: evaluation.ruleId,
  applicable: evaluation.applicable ?? null,
  valueNumber: evaluation.applicable === true ? evaluation.value : null,
})

/**
 * Throws on a row breaking the invariant, a value present if and only if
 * applicable: corrupt data is never reinterpreted.
 */
export const mapRuleEvaluation = (db: RuleEvaluationModel): RuleEvaluation => {
  const base = {
    simulationId: db.simulationId,
    ruleId: db.ruleId,
    createdAt: db.createdAt,
  }

  if (db.applicable === true) {
    if (db.valueNumber === null) {
      throw new Error(
        `Rule evaluation of rule ${db.ruleId} for simulation ${db.simulationId} is applicable without a value`
      )
    }
    return { ...base, applicable: true, value: db.valueNumber }
  }

  if (db.valueNumber !== null) {
    throw new Error(
      `Rule evaluation of rule ${db.ruleId} for simulation ${db.simulationId} has a value without being applicable`
    )
  }

  return { ...base, applicable: db.applicable ?? undefined }
}
