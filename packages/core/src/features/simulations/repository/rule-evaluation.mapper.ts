import type { Prisma } from '../../../prisma/generated/client.ts'
import type { RuleEvaluationModel } from '../../../prisma/generated/models/RuleEvaluation.ts'
import type {
  Applicability,
  NewRuleEvaluation,
  RuleEvaluation,
  RuleValue,
} from '../../models/types/rule-evaluation.ts'
import { CorruptRuleEvaluationError } from '../errors/simulations.error.ts'

/** Each value is stored in the column of its type, the others left null. */
const mapValueToPrisma = (value: RuleValue | undefined) => ({
  valueNumber: typeof value === 'number' ? value : null,
  valueBoolean: typeof value === 'boolean' ? value : null,
  valueString: typeof value === 'string' ? value : null,
})

export const mapNewRuleEvaluationToPrisma = (
  ruleId: number,
  evaluation: NewRuleEvaluation
): Prisma.RuleEvaluationCreateManyInput => ({
  simulationId: evaluation.simulationId,
  ruleId,
  createdAt: evaluation.createdAt,
  applicable: evaluation.applicable ?? null,
  ...mapValueToPrisma(
    evaluation.applicable === true ? evaluation.value : undefined
  ),
})

/**
 * An evaluation→missing-variable link, rule ids resolved by the caller. The
 * missing variable is not evaluated: the link points to its rule row only.
 */
export const mapNewRuleEvaluationMissingVariablesToPrisma = (
  ruleId: number,
  missingRuleId: number,
  evaluation: NewRuleEvaluation,
  missingVariable: NewRuleEvaluation['missingVariables'][number]
): Prisma.RuleEvaluationMissingVariableCreateManyInput => ({
  simulationId: evaluation.simulationId,
  ruleId,
  missingRuleId,
  weight: missingVariable.weight,
})

/** A rule evaluation row joined with its rule. */
type RuleEvaluationRow = RuleEvaluationModel & {
  rule: { name: string; appliesToWaterMetric: boolean }
}

/** Throws a `CorruptRuleEvaluationError` on a row breaking the invariant. */
const applicabilityOf = (db: RuleEvaluationRow): Applicability => {
  const values = [db.valueNumber, db.valueBoolean, db.valueString].filter(
    (value) => value !== null
  )
  const corrupt = (reason: string) => {
    throw new CorruptRuleEvaluationError({
      simulationId: db.simulationId,
      name: db.rule.name,
      reason,
      metric: db.rule.appliesToWaterMetric ? 'water' : null,
    })
  }

  if (db.applicable === true) {
    if (values.length !== 1) {
      corrupt(`is applicable with ${values.length} values`)
    }
    return { applicable: true, value: values[0] }
  }

  if (values.length > 0) {
    corrupt('has a value without being applicable')
  }

  return { applicable: db.applicable ?? undefined }
}

export const mapRuleEvaluation = (db: RuleEvaluationRow): RuleEvaluation => ({
  simulationId: db.simulationId,
  createdAt: db.createdAt,
  name: db.rule.name,
  metric: db.rule.appliesToWaterMetric ? 'water' : null,
  ...applicabilityOf(db),
})
