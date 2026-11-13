import type { Prisma } from '../../../prisma/generated/client.ts'
import type { RuleEvaluationModel } from '../../../prisma/generated/models/RuleEvaluation.ts'
import type { ModelRuleValue } from '../../models/types/model-rule-evaluation.ts'
import type {
  NewRuleEvaluation,
  RuleEvaluation,
} from '../types/rule-evaluation.ts'

/** Each value is stored in the column of its type, the others left null. */
const mapValueToPrisma = (value: ModelRuleValue | undefined) => ({
  valueNumber: typeof value === 'number' ? value : null,
  valueBoolean: typeof value === 'boolean' ? value : null,
  valueString: typeof value === 'string' ? value : null,
})

export const mapNewRuleEvaluationToPrisma = (
  evaluation: NewRuleEvaluation
): Prisma.RuleEvaluationCreateManyInput => ({
  simulationId: evaluation.simulationId,
  ruleId: evaluation.ruleId,
  applicable: evaluation.applicable ?? null,
  ...mapValueToPrisma(
    evaluation.applicable === true ? evaluation.value : undefined
  ),
})

/**
 * Throws on a row breaking the invariant, exactly one value if applicable and
 * none otherwise: corrupt data is never reinterpreted.
 */
export const mapRuleEvaluation = (db: RuleEvaluationModel): RuleEvaluation => {
  const base = {
    simulationId: db.simulationId,
    ruleId: db.ruleId,
    createdAt: db.createdAt,
  }
  const values = [db.valueNumber, db.valueBoolean, db.valueString].filter(
    (value) => value !== null
  )

  if (db.applicable === true) {
    if (values.length !== 1) {
      throw new Error(
        `Rule evaluation of rule ${db.ruleId} for simulation ${db.simulationId} is applicable with ${values.length} values`
      )
    }
    return { ...base, applicable: true, value: values[0] }
  }

  if (values.length > 0) {
    throw new Error(
      `Rule evaluation of rule ${db.ruleId} for simulation ${db.simulationId} has a value without being applicable`
    )
  }

  return { ...base, applicable: db.applicable ?? undefined }
}
