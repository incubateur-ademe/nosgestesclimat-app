'use server'

import { addOrUpdateContact, sendEmail } from '@/adapters/brevoClient'
import {
  InvalidCodeError,
  UnknownCodeError,
  type CodeError,
} from '@/components/authentication/errors'
import { env } from '@/env/server'
import { rateLimitSameRequest } from '@/helpers/server/rateLimitSameRequest'
import logger from '@/logger/logger.server'
import type { Intent } from '@nosgestesclimat/core/features/auth/schemas/auth.schema'
import { LoginPayloadSchema } from '@nosgestesclimat/core/features/auth/schemas/auth.schema'
import { createLogin } from '@nosgestesclimat/core/features/auth/services/login.service'
import { revokeAllSessions } from '@nosgestesclimat/core/features/auth/services/revoke-all-sessions.service'
import type { Logger } from '@nosgestesclimat/core/features/logger/index'
import { maskEmail } from '@nosgestesclimat/core/lib/pii'
import { failure, success, type Result } from '@nosgestesclimat/core/lib/result'
import { toError } from '@nosgestesclimat/core/lib/to-error'
import { validatePayload } from '@nosgestesclimat/core/lib/validate-payload'
import { revalidatePath } from 'next/cache'
import { after } from 'next/server'
import { createAppSession } from './create-app-session'
import { getUserSession } from './get-user-session'

const loginService = createLogin({
  logger,
  sendEmail,
  addOrUpdateContact,
  origin: env.NEXT_PUBLIC_SITE_URL,
  backgroundTaskRunner: after,
})

export const login = logger.withSpan(
  'site.action.login',
  // Known before anything runs: what names the attempt, on the span and on
  // every line below.
  ({ email, intent }: { email: string; intent: Intent }) => ({
    email: maskEmail(email),
    intent,
  }),
  async ({
    email,
    code,
    locale,
    intent,
    logger,
  }: {
    email: string
    code: string
    locale?: string
    intent: Intent
    logger: Logger
  }): Promise<Result<{ userId: string }, CodeError>> => {
    const startedAt = Date.now()

    // The schema lowercases the email before the DB lookup; the throttle key
    // must normalize the same way, or case permutations split the bucket.
    const rateLimit = await rateLimitSameRequest({
      key: `login:${email.toLocaleLowerCase()}`,
      ttlInSeconds: 30,
    })
    if (!rateLimit.success) return rateLimit

    const parsed = validatePayload(LoginPayloadSchema, {
      email,
      code,
      locale,
      intent,
    })
    if (!parsed.success) {
      logger.warn(parsed.error)
      return failure(new UnknownCodeError())
    }
    // The locale only exists once the schema has defaulted it.
    const boundLogger = logger.child({ locale: parsed.data.locale })

    let existingSessionUserId: string | undefined

    try {
      const session = await getUserSession()
      // session.id is the user id, derived server-side from the signed session
      // payload. Passing it to the service directly preserves the "one session
      // id = one account" invariant.
      existingSessionUserId = session?.id

      // Every branch below logs an outcome, so an attempt left without one is
      // how a request that hung - or killed the process - stays visible. The
      // session user is only known here, and the catch needs it too: it stays
      // in the meta of the lines that carry it.
      boundLogger.info('Login attempt', {
        sessionUserId: existingSessionUserId,
      })

      const result = await loginService({
        ...parsed.data,
        sessionUserId: existingSessionUserId,
      })

      if (!result.success) {
        boundLogger.warn(result.error, {
          sessionUserId: existingSessionUserId,
          durationMs: Date.now() - startedAt,
        })

        return failure(new InvalidCodeError())
      }

      const { user, mode } = result.data

      boundLogger.info('Login succeeded', {
        sessionUserId: existingSessionUserId,
        userId: user.id,
        mode,
        durationMs: Date.now() - startedAt,
      })

      if (existingSessionUserId) {
        await revokeAllSessions(existingSessionUserId)
      }
      await createAppSession(user.id, email)

      revalidatePath('/', 'layout')

      return success({ userId: user.id })
    } catch (error) {
      boundLogger.error(toError(error), {
        sessionUserId: existingSessionUserId,
        durationMs: Date.now() - startedAt,
      })

      return failure(new UnknownCodeError())
    }
  }
)
