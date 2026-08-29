'use server'

import type { Simulation } from '@/helpers/server/model/simulations'
import { getUserSession } from '@/services/auth/get-user-session'
import type { UpdateSimulationSituationError } from '@nosgestesclimat/core/features/simulations/errors/simulations.error'
import { updateSimulationSituation as updateSimulationSituationService } from '@nosgestesclimat/core/features/simulations/services/update-simulation-situation.service'
import type { ComputedResultSchema } from '@nosgestesclimat/core/features/simulations/validators/computed-results.schema'
import type { Result } from '@nosgestesclimat/core/lib/result'
import { unauthorized } from 'next/navigation'
import { ensureSimulationModel } from './ensure-simulation-model'

/**
 * Everything answering a question changes, and nothing else: `date`, `polls`
 * and `groups` are owned by creation and the join flows respectively.
 *
 * `extendedSituation` belongs here as `useUpdateCurrentSimulation` rewrites it
 * on every answer and every folded step, so leaving it out would let it drift
 * out of sync with the `situation` it describes until the test is completed.
 */
export type SimulationSituationPayload = Pick<
  Simulation,
  | 'id'
  | 'model'
  | 'situation'
  | 'extendedSituation'
  | 'foldedSteps'
  | 'progression'
  | 'computedResults'
>

/**
 * Saves the progress of a simulation being answered. Scoped to what a question
 * changes.
 */
export const updateSimulationSituation = async (
  payload: SimulationSituationPayload
): Promise<Result<void, UpdateSimulationSituationError>> => {
  const session = await getUserSession()
  if (!session) unauthorized()

  const {
    id,
    model,
    situation,
    extendedSituation,
    foldedSteps,
    progression,
    computedResults,
  } = await ensureSimulationModel(payload)

  return await updateSimulationSituationService({
    userId: session.id,
    simulationId: id,
    situation,
    extendedSituation,
    foldedSteps,
    progression,
    computedResults: computedResults as ComputedResultSchema,
    model,
  })
}
