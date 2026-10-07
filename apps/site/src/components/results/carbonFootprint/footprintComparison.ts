// Average of the 607 609 simulations completed between 2025-10-01 and
// 2026-09-30 (7 946 kg CO₂e), rounded to 8 t. Hardcoded for now.
const AVERAGE_FOOTPRINT_KG = 8000
const CLOSE_TO_AVERAGE_THRESHOLD_KG = 7000

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
