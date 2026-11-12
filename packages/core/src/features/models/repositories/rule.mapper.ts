import type { Metric } from '../../../prisma/generated/enums.ts'
import type { Rule } from '../types/rule.ts'

export interface RuleRow {
  id: number
  name: string
  metric: Metric | null
}

export const mapRule = (row: RuleRow): Rule => ({
  id: row.id,
  name: row.name,
  metric: row.metric,
})
