import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import type { Situation } from 'publicodes'
import { parseModelString } from '../repository/model.mapper.ts'
import { createManySimulations } from '../repository/simulation.repository.ts'
import type { ComputedResults } from '../validators/computed-results.schema.ts'

/**
 * The shape of a simulation as it comes out of long-lived client state
 * (localStorage). The `model` is optional because simulations predating the
 * model field do not have one.
 */
export interface LegacySimulationInput {
  id: string
  date: Date | string
  progression: number
  situation: Situation<DottedName>
  foldedSteps: DottedName[]
  computedResults: ComputedResults
  model?: string
}

/**
 * Imports simulations that were persisted in localStorage before the app
 * stored them server-side. These simulations predate the `model` field
 * entirely, so they are stored without one — the database default applies,
 * which is truthful and keeps them out of the computation queue.
 *
 * Simulations whose `id` already exists in the database are silently skipped.
 */
export const importLegacyLocalSimulations = async ({
  userId,
  simulations,
}: {
  userId: string
  simulations: LegacySimulationInput[]
}): Promise<void> => {
  if (simulations.length === 0) return

  await createManySimulations(
    simulations.map((simulation) => {
      const model = simulation.model
        ? parseModelString(simulation.model)
        : undefined

      return {
        id: simulation.id,
        userId,
        date: new Date(simulation.date),
        progression: simulation.progression,
        situation: simulation.situation,
        foldedSteps: simulation.foldedSteps,
        computedResults: simulation.computedResults,
        ...(model ? { model } : {}),
      }
    })
  )
}
