'use server'

import { sendEmail } from '@/adapters/brevoClient'
import type { Model } from '@/helpers/server/model/models'
import type { Locale } from '@/i18nConfig'
import logger from '@/logger'
import type { ParticipateToPollError } from '@nosgestesclimat/core/features/polls/errors/polls.error'
import { createParticipateToPoll } from '@nosgestesclimat/core/features/polls/services/participate-to-poll.service'
import { type Result } from '@nosgestesclimat/core/lib/result'
import { captureException } from '@sentry/nextjs'
import { after } from 'next/server'
import { ensureUserSession } from '../auth/ensure-user-session'

const participateToPollService = createParticipateToPoll({
  logger,
  captureException,
  sendEmail,
  origin: process.env.NEXT_PUBLIC_SITE_URL!,
  // The action redirects: the email must outlive the request.
  backgroundTaskRunner: (task) => after(task),
})

type ParticipateToPollParams = {
  pollId: string
  locale: Locale
} & (
  | { reuseSimulationId: string; model?: never }
  | { reuseSimulationId?: never; model: Model }
)

/**
 * Enters the current user in a poll, either by reusing a simulation they
 * already completed or by starting a new one.
 */
export const participateToPoll = async (
  params: ParticipateToPollParams
): Promise<Result<{ simulationId: string }, ParticipateToPollError>> => {
  // A visitor can land straight on a campaign without ever having answered
  // anything: they need an identity before joining it.
  const session = await ensureUserSession()

  const { pollId, locale } = params

  return await participateToPollService(
    params.reuseSimulationId === undefined
      ? { userSession: session, pollId, locale, model: params.model }
      : {
          userSession: session,
          pollId,
          locale,
          reuseSimulationId: params.reuseSimulationId,
        }
  )
}
