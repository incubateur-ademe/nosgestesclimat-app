import { THIRD_OBJECTIVE } from '../objective/_constants/objectives'

// Average of the 607 609 simulations completed between 2025-10-01 and
// 2026-09-30 (7 946 kg CO₂e), rounded to 8 t. Hardcoded for now.
export const AVERAGE_FOOTPRINT_KG = 8000
const CLOSE_TO_AVERAGE_THRESHOLD_KG = 7000

// Keeps a very small footprint visible next to the average bar
const MIN_BAR_PERCENT = 8

export type FootprintComparisonLevel = 'above' | 'close' | 'below'

export function getFootprintComparison(footprintKg: number): {
  level: FootprintComparisonLevel
  deltaKg: number
} {
  // The gap is displayed in tenths of a tonne, like the footprint itself
  const deltaKg = Math.round(footprintKg / 100) * 100 - AVERAGE_FOOTPRINT_KG

  if (footprintKg > AVERAGE_FOOTPRINT_KG) return { level: 'above', deltaKg }
  if (footprintKg >= CLOSE_TO_AVERAGE_THRESHOLD_KG) {
    return { level: 'close', deltaKg }
  }
  return { level: 'below', deltaKg }
}

/**
 * Bar lengths of the comparison chart, in percent of the chart: the longest
 * bar fills it. The 2050 objective (2 t) is always under the average.
 */
export function getComparisonBarPercents(footprintKg: number): {
  footprint: number
  average: number
  objective: number
} {
  const scaleMax = Math.max(footprintKg, AVERAGE_FOOTPRINT_KG)

  return {
    footprint: Math.max((footprintKg / scaleMax) * 100, MIN_BAR_PERCENT),
    average: (AVERAGE_FOOTPRINT_KG / scaleMax) * 100,
    objective: (THIRD_OBJECTIVE.value / scaleMax) * 100,
  }
}
