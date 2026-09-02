'use server'

import { getUserSession } from '@/services/auth/get-user-session'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import { type UpdateSimulationSituationError } from '@nosgestesclimat/core/features/simulations/errors/simulations.error'
import { updateSimulationSituation as updateSimulationSituationService } from '@nosgestesclimat/core/features/simulations/services/update-simulation-situation.service'
import { type Result } from '@nosgestesclimat/core/lib/result'
import { validatePayload } from '@nosgestesclimat/core/lib/validate-payload'
import { unauthorized } from 'next/navigation'
import { ensureSimulationModel } from './ensure-simulation-model'
import {
  type UpdateSimulationSituationPayload,
  UpdateSimulationSituationPayloadSchema,
} from './update-simulation-situation-payload.schema'

/**
 * Saves the progress of a simulation being answered. Scoped to what a question
 * changes.
 */
export const updateSimulationSituation = async (
  payload: UpdateSimulationSituationPayload
): Promise<Result<void, UpdateSimulationSituationError>> => {
  const session = await getUserSession()
  if (!session) unauthorized()

  const parsed = validatePayload(
    UpdateSimulationSituationPayloadSchema,
    payload
  )
  if (!parsed.success) {
    return parsed
  }

  const { id, model, situation, foldedSteps, progression, computedResults } =
    await ensureSimulationModel(parsed.data)

  return await updateSimulationSituationService({
    userId: session.id,
    simulationId: id,
    situation,
    foldedSteps: foldedSteps as DottedName[],
    progression,
    computedResults,
    model,
  })
}
