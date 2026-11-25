import type { Prisma } from '../../../prisma/generated/client.ts'
import type { RuleEvaluationModel } from '../../../prisma/generated/models/RuleEvaluation.ts'
import type {
  Applicability,
  ModelRuleEvaluation,
  ModelRuleValue,
} from '../../models/types/model-rule-evaluation.ts'
import { CorruptRuleEvaluationError } from '../errors/simulations.error.ts'

/** Each value is stored in the column of its type, the others left null. */
const mapValueToPrisma = (value: ModelRuleValue | undefined) => ({
  valueNumber: typeof value === 'number' ? value : null,
  valueBoolean: typeof value === 'boolean' ? value : null,
  valueString: typeof value === 'string' ? value : null,
})

export const mapModelRuleEvaluationToPrisma = (
  ruleId: number,
  evaluation: ModelRuleEvaluation
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
 * Maps the link from an evaluation to one of its missing variables, the rule
 * ids resolved by the caller. The missing variable is not evaluated: the link
 * points to its rule row only.
 */
export const mapModelRuleEvaluationMissingVariablesToPrisma = (
  ruleId: number,
  missingRuleId: number,
  evaluation: ModelRuleEvaluation,
  missingVariable: ModelRuleEvaluation['missingVariables'][number]
): Prisma.RuleEvaluationMissingVariableCreateManyInput => ({
  simulationId: evaluation.simulationId,
  ruleId,
  missingRuleId,
  weight: missingVariable.weight,
})

/** A rule evaluation row joined with its rule and its missing variables' rules. */
type RuleEvaluationRow = RuleEvaluationModel & {
  rule: { name: string; appliesToWaterMetric: boolean }
  missingVariables: {
    weight: number
    missingVariable: { name: string }
  }[]
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

export const mapModelRuleEvaluation = (
  db: RuleEvaluationRow
): ModelRuleEvaluation => ({
  simulationId: db.simulationId,
  createdAt: db.createdAt,
  name: db.rule.name,
  metric: db.rule.appliesToWaterMetric ? 'water' : null,
  missingVariables: db.missingVariables.map(({ weight, missingVariable }) => ({
    name: missingVariable.name,
    weight,
  })),
  ...applicabilityOf(db),
})
