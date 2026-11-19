import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import type { Situation } from 'publicodes'
import type { SimulationStatus } from '../../../prisma/generated/client.ts'
import { parseModel } from '../../models/helpers/model-versions.ts'
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
  /** Simulations stored before the status column carry only a progression. */
  progression?: number
  status?: SimulationStatus
  situation: Situation<DottedName>
  foldedSteps: DottedName[]
  computedResults: ComputedResults
  model?: string
}

/** Translates the legacy progression into the lifecycle status. */
const legacyStatus = (progression: number | undefined): SimulationStatus => {
  if (progression === 1) return 'full_result_seen'
  if (!progression) return 'not_started'
  return 'answering_major_questions'
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
      const model = simulation.model ? parseModel(simulation.model) : undefined

      return {
        id: simulation.id,
        userId,
        date: new Date(simulation.date),
        status: simulation.status ?? legacyStatus(simulation.progression),
        situation: simulation.situation,
        foldedSteps: simulation.foldedSteps,
        computedResults: simulation.computedResults,
        ...(model ? { model } : {}),
      }
    })
  )
}
