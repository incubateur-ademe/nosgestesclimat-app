import type { Prisma } from '../../../prisma/generated/client.ts'
import type { Metric as MetricRow } from '../../../prisma/generated/enums.ts'
import type { Metric, NewRuleEvaluation, Rule } from '../types/rule.ts'

const METRIC_TO_ROW = {
  carbone: 'carbon',
  eau: 'water',
} as const satisfies Record<Metric, MetricRow>

const ROW_TO_METRIC = {
  carbon: 'carbone',
  water: 'eau',
} as const satisfies Record<MetricRow, Metric>

export const mapMetricToRow = (metric: Metric): MetricRow =>
  METRIC_TO_ROW[metric]

export interface RuleRow {
  id: number
  name: string
  metric: MetricRow
}

export const mapRule = (row: RuleRow): Rule => ({
  id: row.id,
  name: row.name,
  metric: ROW_TO_METRIC[row.metric],
})

export const mapNewRuleEvaluationToPrisma = (
  evaluation: NewRuleEvaluation
): Prisma.RuleEvaluationCreateManyInput => ({
  simulationId: evaluation.simulationId,
  ruleId: evaluation.ruleId,
  applicable: evaluation.applicable,
  valueNumber: evaluation.applicable === true ? evaluation.value : null,
})
