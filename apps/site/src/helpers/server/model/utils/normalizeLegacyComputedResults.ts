import type { ComputedResults } from '@/publicodes-state/types'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import type { Simulation } from '../simulations'

function needsComputedResultsMigration(simulation: Simulation): boolean {
  return simulation.computedResults.carbone === undefined
}

export function hasDisplayableComputedResults(simulation: Simulation): boolean {
  return simulation.computedResults.carbone?.bilan !== undefined
}

/**
 * Wraps legacy computedResults (`{ bilan, categories, ... }`) into the
 * current `{ carbone, eau }` shape
 */
export function normalizeLegacyComputedResults(
  simulation: Simulation
): Simulation {
  if (!needsComputedResultsMigration(simulation)) {
    return simulation
  }

  const computedResults = simulation.computedResults as
    | ComputedResults
    | { bilan?: number; categories?: Record<string, number> }

  // Only wrap when a legacy bilan is present; otherwise leave unchanged so
  // callers can filter out simulations with no displayable results.
  if (!('bilan' in computedResults) || computedResults.bilan === undefined) {
    return simulation
  }

  return {
    ...simulation,
    computedResults: {
      carbone: computedResults as ComputedResults['carbone'],
      eau: {
        bilan: 0,
        categories: {} as Record<DottedName, number>,
        subcategories: {} as Record<DottedName, number>,
      },
    },
  }
}
