import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import type { Migration } from '@publicodes/tools/migration'
import { migrateSituation } from '@publicodes/tools/migration'
import type { Simulation } from '../../helpers/server/model/simulations'
import type { ComputedResults } from '../types'

export function migrateSimulation(
  simulation: Simulation & {
    group?: string
    poll?: string
    computedResults:
      | ComputedResults
      | { bilan?: number; categories?: Record<string, number> }
  },
  migrationInstructions: Migration | undefined
): Simulation {
  if (migrationInstructions) {
    simulation.situation = migrateSituation(
      simulation.situation,
      migrationInstructions
    )

    // NOTE: folded steps (i.e. answered rules) are can be map to a situation,
    // where the keys are the rule names and the value is undefined.
    // NOTE: We should filter foldedSteps that are not questions here
    simulation.foldedSteps = Object.keys(
      migrateSituation(
        Object.fromEntries(
          simulation.foldedSteps.map((step) => [step, undefined])
        ),
        migrationInstructions
      )
    ) as DottedName[]
  }

  // If the computedResults object does not take multiple metrics into account, we add them
  if (
    'bilan' in simulation.computedResults &&
    (simulation.computedResults as { bilan?: number }).bilan !== undefined
  ) {
    const newComputedResults: ComputedResults = {
      carbone: simulation.computedResults as ComputedResults['carbone'],
      eau: {
        bilan: 0,
        categories: {} as Record<DottedName, number>,
        subcategories: {} as Record<DottedName, number>,
      },
    }
    simulation.computedResults = newComputedResults
  }

  return simulation
}
