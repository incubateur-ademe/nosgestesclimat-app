import type { Rule } from '../types/rule.ts'

export interface RuleRow {
  id: number
  name: string
  public: boolean
  appliesToWaterMetric: boolean
}

export const mapRule = (row: RuleRow): Rule => ({
  id: row.id,
  name: row.name,
  public: row.public,
  appliesToWaterMetric: row.appliesToWaterMetric,
})
