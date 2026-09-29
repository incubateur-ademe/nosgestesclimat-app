'use server'

import { sendEmail } from '@/adapters/brevoClient'
import {
  UnknownCodeError,
  type EmailError,
} from '@/components/authentication/errors'
import { rateLimitSameRequest } from '@/helpers/server/rateLimitSameRequest'
import logger from '@/logger'
import type { AuthenticationMode } from '@/types/authentication'
import { CreateVerificationCodePayloadSchema } from '@nosgestesclimat/core/features/auth/schemas/verification-codes.schema'
import { createVerificationCodeService } from '@nosgestesclimat/core/features/auth/services/create-verification-code.service'
import { maskEmail } from '@nosgestesclimat/core/lib/pii'
import { failure, success, type Result } from '@nosgestesclimat/core/lib/result'
import { validatePayload } from '@nosgestesclimat/core/lib/validate-payload'
import { captureException } from '@sentry/nextjs'
import { after } from 'next/server'

const verificationCodeService = createVerificationCodeService({
  logger,
  captureException,
  sendEmail,
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
}): Promise<Result<{ expirationDate: Date }, EmailError>> => {
  const startedAt = Date.now()

  // The schema lowercases the email before the DB lookup; the throttle key
  // must normalize the same way, or case permutations split the bucket.
  const rateLimit = await rateLimitSameRequest({
    key: `verification-code:${email.toLocaleLowerCase()}`,
    ttlInSeconds: 30,
  })
  if (!rateLimit.success) return rateLimit

  const parsed = validatePayload(CreateVerificationCodePayloadSchema, {
    email,
    locale,
  })
  if (!parsed.success) {
    return failure(new UnknownCodeError())
  }

  const context = {
    email: maskEmail(email),
    locale: parsed.data.locale,
  }

  try {
    const { expirationDate } = await verificationCodeService({
      email: parsed.data.email,
      locale: parsed.data.locale,
    })

    // The old server controller logged the creation: this line is the anchor
    // for "user never received a code" investigations.
    logger.info('VerificationCode created', {
      ...context,
      expirationDate,
      durationMs: Date.now() - startedAt,
    })

    return success({ expirationDate })
  } catch (error) {
    const outcome = { ...context, durationMs: Date.now() - startedAt }

    logger.error('VerificationCode creation failed', { ...outcome, error })
    captureException(error, { extra: outcome })

    return failure(new UnknownCodeError())
  }
}
