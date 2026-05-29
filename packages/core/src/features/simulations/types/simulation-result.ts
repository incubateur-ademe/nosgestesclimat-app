import type { ComputedResult } from './computed-result.ts'

export interface SimulationResult {
  computedResults: ComputedResult
  group: { name: string; id: string } | null
  poll: { name: string; id: string; slug: string } | null
  tendency?: Tendency
  hasPreviousResult?: boolean
}

export type Tendency = 'increase' | 'decrease'
