'use server'

import { addOrUpdateContact, sendEmail } from '@/adapters/brevoClient'
import {
  EMAIL_PAGE_PATH,
  END_PAGE_PATH,
  GROUP_RESULTS_ROUTE_PATTERN,
} from '@/constants/urls/paths'
import { env } from '@/env/server'
import { getLocaleFromHeaders } from '@/helpers/server/getLocaleForNotFoundOrUnautorizedPage'
import logger from '@/logger/logger.server'
import { getUserSession } from '@/services/auth/get-user-session'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import { type CompleteSimulationError } from '@nosgestesclimat/core/features/simulations/errors/simulations.error'
import { createCompleteSimulation } from '@nosgestesclimat/core/features/simulations/services/complete-simulation.service'
import { type Result } from '@nosgestesclimat/core/lib/result'
import { validatePayload } from '@nosgestesclimat/core/lib/validate-payload'
import { revalidatePath } from 'next/cache'
import { redirect, unauthorized } from 'next/navigation'
import { after } from 'next/server'
import type { Situation } from 'publicodes'
import { match, P } from 'ts-pattern'
import {
  type CompleteSimulationPayload,
  CompleteSimulationPayloadSchema,
} from './complete-simulation-payload.schema'
import { ensureSimulationModel } from './ensure-simulation-model'

const completeSimulationService = createCompleteSimulation({
  logger,
  sendEmail,
  addOrUpdateContact,
  origin: env.NEXT_PUBLIC_SITE_URL,
  // The action redirects: side effects must outlive the request.
  backgroundTaskRunner: after,
})

export const completeSimulation = async (
  payload: CompleteSimulationPayload
): Promise<Result<never, CompleteSimulationError> | void> =>
  await logger
    .child({ simulationId: payload.id })
    .withSpan('site.action.completeSimulation', async (logger) => {
      const session = await getUserSession()
      if (!session) unauthorized()

      const parsed = validatePayload(CompleteSimulationPayloadSchema, payload)
      if (!parsed.success) {
        logger.warn(parsed.error)
        return parsed
      }

      const { id, progression, situation, foldedSteps, computedResults } =
        parsed.data

      const { model } = await ensureSimulationModel(parsed.data, logger)

      const result = await completeSimulationService({
        userSession: session,
        simulationId: id,
        progression,
        model,
        situation: situation as Situation<DottedName>,
        foldedSteps: foldedSteps as DottedName[],
        computedResults,
        locale: await getLocaleFromHeaders(),
      })

      if (!result.success) {
        match(result.error.code)
          .with(
            P.union(
              'computation_already_exists',
              'invalid_payload',
              'simulation_invalid_model',
              'simulation_not_found',
              'simulation_incomplete',
              'zero_footprint'
            ),
            () => logger.error(result.error)
          )
          .with('simulation_completed', () => logger.warn(result.error))
          .exhaustive()
        return result
      }

      revalidatePath(END_PAGE_PATH, 'layout')

      const { groups, polls } = result.data

      if (groups?.length) revalidatePath(GROUP_RESULTS_ROUTE_PATTERN, 'page')

      if (!session.isAuth && (polls?.length || groups?.length))
        redirect(EMAIL_PAGE_PATH)

      redirect(END_PAGE_PATH)
    })
