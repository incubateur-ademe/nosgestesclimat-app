'use server'

import { addOrUpdateContact, sendEmail } from '@/adapters/brevoClient'
import {
  InvalidCodeError,
  RateLimitedError,
  UnknownCodeError,
  type CodeError,
} from '@/components/authentication/errors'
import { env } from '@/env.server'
import { rateLimitSameRequest } from '@/helpers/server/rateLimitSameRequest'
import logger, { maskEmail } from '@/logger'
import {
  createAddOrUpdateContactAfterLogin,
  createSendWelcomeEmail,
} from '@nosgestesclimat/core/features/auth/emails/auth-emails'
import { LoginDto } from '@nosgestesclimat/core/features/auth/schemas/verification-codes.schema'
import { createLogin } from '@nosgestesclimat/core/features/auth/services/login.service'
import { revokeAllSessions } from '@nosgestesclimat/core/features/auth/services/revoke-all-sessions.service'
import { failure, success, type Result } from '@nosgestesclimat/core/lib/result'
import { validatePayload } from '@nosgestesclimat/core/lib/validate-payload'
import { captureException } from '@sentry/nextjs'
import { revalidatePath } from 'next/cache'
import { after } from 'next/server'
import { createAppSession } from './create-app-session'
import { getUserSession } from './get-user-session'
import { resolveLocale } from './resolve-locale'

// Error handling for the background email side effects lives inside the core
// service (a failing email must never fail the login), so the site injects
// the plain scheduler.
const loginService = createLogin({
  logger,
  captureException,
  sendWelcomeEmail: createSendWelcomeEmail(sendEmail),
  addOrUpdateContactAfterLogin:
    createAddOrUpdateContactAfterLogin(addOrUpdateContact),
  origin: env.NEXT_PUBLIC_SITE_URL,
  backgroundTaskRunner: after,
})

export const login = async ({
  email,
  code,
  locale,
}: {
  email: string
  code: string
  locale?: string
}): Promise<Result<{ userId: string }, CodeError>> => {
  const startedAt = Date.now()

  // The schema lowercases the email before the DB lookup; the throttle key
  // must normalize the same way, or case permutations split the bucket.
  if (
    !rateLimitSameRequest({
      key: `login:${email.toLocaleLowerCase()}`,
      ttlMs: 30_000,
    })
  ) {
    return failure(new RateLimitedError())
  }

  // The old route validated the locale query the same way: an unsupported
  // locale never reached the service, and a missing one defaulted to 'fr' -
  // so every log below carries a concrete locale.
  const loginLocale = resolveLocale(locale)
  if (loginLocale === undefined) {
    return failure(new UnknownCodeError())
  }

  // The old action wrapped its entire body in one try: any throw collapsed
  // to failure(new UnknownCodeError()). The session lookup runs inside the
  // try so its failures collapse the same way instead of surfacing to
  // useLogin as a rejected mutation.
  let sessionUserId: string | undefined

  // The old route logged the validated (schema-normalized) email; before
  // validation the raw argument is the only value available.
  let maskedEmail = maskEmail(email)

  try {
    const session = await getUserSession()
    // session.id is the user id, derived server-side from the signed session
    // payload. Passing it to the service directly preserves the "one session
    // id = one account" invariant.
    sessionUserId = session?.id

    const parsed = validatePayload(LoginDto, { email, code })
    if (!parsed.success) {
      // An invalid body used to answer 400 from the server, which the old
      // catch collapsed into UnknownCodeError - the form guarantees a
      // well-formed email and a 6-digit code client-side, so this is
      // unreachable from the UI.
      return failure(new UnknownCodeError())
    }

    maskedEmail = maskEmail(parsed.data.email)

    const context = {
      userId: sessionUserId,
      email: maskedEmail,
      locale: loginLocale,
    }

    // Every branch below logs an outcome, so an attempt left without one is
    // how a request that hung - or killed the process - stays visible.
    logger.info('Login attempt', context)

    const result = await loginService({
      loginDto: parsed.data,
      locale: loginLocale,
      sessionUserId,
    })

    if (!result.success) {
      // InvalidVerificationCodeError is the only domain failure; the Sentry
      // signal replaces the diagnosis context that is gone.
      const outcome = { ...context, durationMs: Date.now() - startedAt }

      logger.warn('Login rejected: invalid verification code', outcome)

      captureException(result.error, { level: 'warning', extra: outcome })

      return failure(new InvalidCodeError())
    }

    const { user, mode } = result.data

    logger.info('Login succeeded', {
      ...context,
      mode,
      durationMs: Date.now() - startedAt,
    })

    if (sessionUserId) {
      await revokeAllSessions(sessionUserId)
    }
    await createAppSession(user.id, email)

    revalidatePath('/', 'layout')

    return success({ userId: user.id })
  } catch (error) {
    const outcome = {
      userId: sessionUserId,
      email: maskedEmail,
      locale: loginLocale,
      durationMs: Date.now() - startedAt,
    }

    logger.error('Login failed', { ...outcome, error })

    captureException(error, { extra: outcome })

    return failure(new UnknownCodeError())
  }
}
