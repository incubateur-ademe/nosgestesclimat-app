'use server'

import { addOrUpdateContact, sendEmail } from '@/adapters/brevoClient'
import {
  EMAIL_PAGE_PATH,
  END_PAGE_PATH,
  GROUP_RESULTS_ROUTE_PATTERN,
} from '@/constants/urls/paths'
import { getLocaleFromHeaders } from '@/helpers/server/getLocaleForNotFoundOrUnautorizedPage'
import logger from '@/logger'
import { getUserSession } from '@/services/auth/get-user-session'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import { type CompleteSimulationError } from '@nosgestesclimat/core/features/simulations/errors/simulations.error'
import { createCompleteSimulation } from '@nosgestesclimat/core/features/simulations/services/complete-simulation.service'
import { type Result } from '@nosgestesclimat/core/lib/result'
import { validatePayload } from '@nosgestesclimat/core/lib/validate-payload'
import { captureException } from '@sentry/nextjs'
import { revalidatePath } from 'next/cache'
import { redirect, unauthorized } from 'next/navigation'
import { after } from 'next/server'
import type { Situation } from 'publicodes'
import {
  type CompleteSimulationPayload,
  CompleteSimulationPayloadSchema,
} from './complete-simulation-payload.schema'

const completeSimulationService = createCompleteSimulation({
  logger,
  captureException,
  sendEmail,
  addOrUpdateContact,
  origin: process.env.NEXT_PUBLIC_SITE_URL!,
  // The action redirects: side effects must outlive the request.
  runInBackground: (task) => after(task),
})

export const completeSimulation = async (
  payload: CompleteSimulationPayload
): Promise<Result<never, CompleteSimulationError> | void> => {
  const session = await getUserSession()
  if (!session) unauthorized()

  const parsed = validatePayload(CompleteSimulationPayloadSchema, payload)
  if (!parsed.success) return parsed

  const { id, progression, situation, foldedSteps, computedResults } =
    parsed.data

  const result = await completeSimulationService({
    userSession: session,
    simulationId: id,
    progression,
    situation: situation as Situation<DottedName>,
    foldedSteps: foldedSteps as DottedName[],
    computedResults,
    locale: await getLocaleFromHeaders(),
  })

  if (!result.success) return result

  revalidatePath(END_PAGE_PATH, 'layout')

  const { groups, polls } = result.data

  if (groups?.length) revalidatePath(GROUP_RESULTS_ROUTE_PATTERN, 'page')

  if (!session.isAuth && (polls?.length || groups?.length))
    redirect(EMAIL_PAGE_PATH)

  redirect(END_PAGE_PATH)
}
