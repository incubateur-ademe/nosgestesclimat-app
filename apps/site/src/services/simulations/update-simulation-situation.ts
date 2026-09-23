'use server'

import logger from '@/logger.server'
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
): Promise<Result<void, UpdateSimulationSituationError>> =>
  await logger.withSpan(
    'site.service.updateSimulationSituation',
    async (actionLogger) => {
      const session = await getUserSession()
      if (!session) unauthorized()

      const parsed = validatePayload(
        UpdateSimulationSituationPayloadSchema,
        payload
      )
      if (!parsed.success) {
        // Un client correct n'envoie pas ça : dérive ou bug front, suivi au taux.
        actionLogger.warn(parsed.error)
        return parsed
      }

      const {
        id,
        model,
        situation,
        foldedSteps,
        progression,
        computedResults,
      } = await ensureSimulationModel(parsed.data)

      const result = await updateSimulationSituationService({
        userId: session.id,
        simulationId: id,
        situation,
        foldedSteps: foldedSteps as DottedName[],
        progression,
        computedResults,
        model,
      })

      if (!result.success) {
        // Une simulation absente vient d'un lien périmé : rien à signaler.
        if (result.error.code === 'simulation_not_found') return result

        if (result.error.code === 'zero_footprint') {
          // Le calcul front a produit un bilan nul : la sauvegarde est refusée,
          // c'est le client qu'il faut réparer.
          actionLogger.error(result.error)
          return result
        }

        // Client périmé (onglet rouvert) ou double soumission : anomalie, au taux.
        actionLogger.warn(result.error)
      }

      return result
    }
  )
