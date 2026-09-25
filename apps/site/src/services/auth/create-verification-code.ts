'use server'

import { sendEmail } from '@/adapters/brevoClient'
import {
  RateLimitedError,
  UnknownCodeError,
  type EmailError,
} from '@/components/authentication/errors'
import { rateLimitSameRequest } from '@/helpers/server/rateLimitSameRequest'
import logger, { maskEmail } from '@/logger'
import type { AuthenticationMode } from '@/types/authentication'
import { createSendVerificationCodeEmail } from '@nosgestesclimat/core/features/auth/emails/auth-emails'
import { VerificationCodeCreateDto } from '@nosgestesclimat/core/features/auth/schemas/verification-codes.schema'
import { createVerificationCodeService } from '@nosgestesclimat/core/features/auth/services/create-verification-code.service'
import { failure, success, type Result } from '@nosgestesclimat/core/lib/result'
import { validatePayload } from '@nosgestesclimat/core/lib/validate-payload'
import { captureException } from '@sentry/nextjs'
import { after } from 'next/server'
import { resolveLocale } from './resolve-locale'

const verificationCodeService = createVerificationCodeService({
  logger,
  captureException,
  sendVerificationCodeEmail: createSendVerificationCodeEmail(sendEmail),
  // The action returns before the email is dispatched: the task must outlive
  // the request.
  backgroundTaskRunner: after,
})

export const createVerificationCode = async ({
  email,
  /**
   * @deprecated Ignored: `mode` was accepted by the HTTP query validator and
   * then ignored by the service (the core DTO is email-only). Kept in the
   * signature for contract compatibility; removing it from the hook/UI is a
   * separate site-only cleanup.
   */
  mode: _mode,
  locale,
}: {
  email: string
  mode?: AuthenticationMode
  locale?: string
}): Promise<Result<{ expirationDate: string }, EmailError>> => {
  const startedAt = Date.now()

  // The schema lowercases the email before the DB lookup; the throttle key
  // must normalize the same way, or case permutations split the bucket.
  if (
    !rateLimitSameRequest({
      key: `verification-code:${email.toLocaleLowerCase()}`,
      ttlMs: 30_000,
    })
  ) {
    return failure(new RateLimitedError())
  }

  // An invalid email was a 400 from the HTTP validator that the previous
  // implementation collapsed into its generic unknown error.
  const parsed = validatePayload(VerificationCodeCreateDto, { email })
  if (!parsed.success) {
    return failure(new UnknownCodeError())
  }

  // The old HTTP query validator defaulted a missing locale to 'fr' and
  // rejected any other value with a 400, likewise collapsed to the generic
  // unknown error.
  const resolvedLocale = resolveLocale(locale)
  if (resolvedLocale === undefined) {
    return failure(new UnknownCodeError())
  }

  const context = {
    email: maskEmail(email),
    locale,
  }

  try {
    const { expirationDate } = await verificationCodeService({
      email: parsed.data.email,
      locale: resolvedLocale,
    })

    // The old server controller logged the creation: this line is the anchor
    // for "user never received a code" investigations.
    logger.info('VerificationCode created', {
      ...context,
      expirationDate,
      durationMs: Date.now() - startedAt,
    })

    return success({ expirationDate: expirationDate.toISOString() })
  } catch (error) {
    const outcome = { ...context, durationMs: Date.now() - startedAt }

    logger.error('VerificationCode creation failed', { ...outcome, error })

    // Unexpected infrastructure failure (e.g. a Prisma error): keep the
    // Sentry signal the deleted server controller had.
    captureException(error, { extra: outcome })

    return failure(new UnknownCodeError())
  }
}
