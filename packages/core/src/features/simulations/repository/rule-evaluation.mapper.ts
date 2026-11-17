import type { Prisma } from '../../../prisma/generated/client.ts'
import type { RuleEvaluationModel } from '../../../prisma/generated/models/RuleEvaluation.ts'
import type { ModelRuleValue } from '../../models/types/model-rule-evaluation.ts'
import { CorruptRuleEvaluationError } from '../errors/simulations.error.ts'
import type {
  DetailedRuleEvaluation,
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

/** One link per missing variable the evaluation reported. */
export const mapNewRuleEvaluationMissingVariablesToPrisma = ({
  simulationId,
  ruleId,
  missingVariables,
}: NewRuleEvaluation): Prisma.RuleEvaluationMissingVariableCreateManyInput[] =>
  missingVariables.map((missingVariable) => ({
    simulationId,
    ruleId,
    missingRuleId: missingVariable.ruleId,
    weight: missingVariable.weight,
  }))

/** Throws a `CorruptRuleEvaluationError` on a row breaking the invariant. */
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
      throw new CorruptRuleEvaluationError({
        simulationId: db.simulationId,
        ruleId: db.ruleId,
        reason: `is applicable with ${values.length} values`,
      })
    }
    return { ...base, applicable: true, value: values[0] }
  }

  if (values.length > 0) {
    throw new CorruptRuleEvaluationError({
      simulationId: db.simulationId,
      ruleId: db.ruleId,
      reason: 'has a value without being applicable',
    })
  }

  return { ...base, applicable: db.applicable ?? undefined }
}

/** Throws a `CorruptRuleEvaluationError` on a row breaking the invariant. */
export const mapDetailedRuleEvaluation = (
  db: RuleEvaluationModel & {
    missingVariables: { weight: number; missingVariable: RuleEvaluationModel }[]
  }
): DetailedRuleEvaluation => ({
  ...mapRuleEvaluation(db),
  missingVariables: db.missingVariables.map(({ weight, missingVariable }) => ({
    ...mapRuleEvaluation(missingVariable),
    weight,
  })),
})
