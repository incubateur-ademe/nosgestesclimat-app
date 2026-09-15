'use server'

import { sendEmail } from '@/adapters/brevoClient'
import { env } from '@/env.server'
import logger from '@/logger'
import { ISOSupportedLanguageSchema } from '@nosgestesclimat/core/features/geo/types/language'
import type { ParticipateToPollError } from '@nosgestesclimat/core/features/polls/errors/polls.error'
import { createParticipateToPoll } from '@nosgestesclimat/core/features/polls/services/participate-to-poll.service'
import { ModelSchema } from '@nosgestesclimat/core/features/simulations/types/model'
import { type Result } from '@nosgestesclimat/core/lib/result'
import { validatePayload } from '@nosgestesclimat/core/lib/validate-payload'
import { captureException } from '@sentry/nextjs'
import { after } from 'next/server'
import * as v from 'valibot'
import { ensureUserSession } from '../auth/ensure-user-session'

const participateToPollService = createParticipateToPoll({
  logger,
  captureException,
  sendEmail,
  origin: env.NEXT_PUBLIC_SITE_URL,
  // The action redirects: the email must outlive the request.
  backgroundTaskRunner: (task) => after(task),
})

const ParticipateToPollPayloadSchema = v.union([
  v.strictObject({
    pollId: v.string(),
    locale: ISOSupportedLanguageSchema,
    reuseSimulationId: v.pipe(v.string(), v.uuid()),
  }),
  v.strictObject({
    pollId: v.string(),
    locale: ISOSupportedLanguageSchema,
    model: ModelSchema,
  }),
])

type ParticipateToPollPayload = v.InferOutput<
  typeof ParticipateToPollPayloadSchema
>

/**
 * Enters the current user in a poll, either by reusing a simulation they
 * already completed or by starting a new one.
 */
export const participateToPoll = async (
  params: ParticipateToPollPayload
): Promise<Result<{ simulationId: string }, ParticipateToPollError>> => {
  // A visitor can land straight on a campaign without ever having answered
  // anything: they need an identity before joining it.
  const session = await ensureUserSession()

  const parsed = validatePayload(ParticipateToPollPayloadSchema, params)
  if (!parsed.success) return parsed

  const { pollId, locale } = parsed.data

  return await participateToPollService(
    'reuseSimulationId' in parsed.data
      ? {
          userSession: session,
          pollId,
          locale,
          reuseSimulationId: parsed.data.reuseSimulationId,
        }
      : {
          userSession: session,
          pollId,
          locale,
          model: parsed.data.model,
        }
  )
}
