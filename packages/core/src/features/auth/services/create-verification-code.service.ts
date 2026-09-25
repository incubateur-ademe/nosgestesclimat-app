import { randomInt } from 'node:crypto'

import type { BackgroundTaskRunner } from '../../../lib/background-task-runner.ts'
import { prisma } from '../../../prisma/client.ts'
import { VerificationCodeUsage } from '../../../prisma/generated/client.ts'
import type { ISOSupportedLanguage } from '../../geo/types/language.ts'
import type { CaptureException, Logger } from '../../logger/index.ts'
import type { createSendVerificationCodeEmail } from '../emails/auth-emails.ts'
import { createUserVerificationCode } from '../repositories/verification-codes.repository.ts'
import type { VerificationCodeCreateDto } from '../schemas/verification-codes.schema.ts'

type SendVerificationCodeEmail = ReturnType<
  typeof createSendVerificationCodeEmail
>

interface CreateVerificationCodeDependencies {
  logger: Logger
  captureException: CaptureException
  sendVerificationCodeEmail: SendVerificationCodeEmail
  /** Runs the email outside of the request lifecycle */
  backgroundTaskRunner: BackgroundTaskRunner
  /**
   * What the created code unlocks. Defaults to the site login usage; flows
   * reusing the service for another purpose (the integrations API token)
   * inject their own discriminator.
   */
  usage?: VerificationCodeUsage
  /** Code generator, overridable by tests that need to know the code */
  generateCode?: () => string
}

const VERIFICATION_CODE_TTL_MS = 60 * 60 * 1000 // 1 hour

export const generateRandomVerificationCode = () =>
  randomInt(100_000, 1_000_000).toString()

export function createVerificationCodeService({
  logger,
  captureException,
  sendVerificationCodeEmail,
  backgroundTaskRunner,
  usage = VerificationCodeUsage.login,
  generateCode = generateRandomVerificationCode,
}: CreateVerificationCodeDependencies) {
  return async function createVerificationCode({
    email,
    locale,
  }: {
    /** Email validated through `VerificationCodeCreateDto` by the caller */
    email: VerificationCodeCreateDto['email']
    locale: ISOSupportedLanguage
  }): Promise<{ email: string; expirationDate: Date }> {
    const code = generateCode()
    const expirationDate = new Date(Date.now() + VERIFICATION_CODE_TTL_MS)

    // The code must be committed *before* the email is handed to Brevo. Sending
    // inside the transaction means any later failure (a Brevo timeout, or the
    // call simply outliving the interactive transaction budget) rolls the row
    // back after Brevo has already accepted — and delivered — the message. The
    // user then holds a legitimate-looking code that does not exist in database,
    // and every attempt to use it comes back as "invalid".
    const verificationCode = await createUserVerificationCode(
      {
        email,
        code,
        expirationDate,
        usage,
      },
      { session: prisma }
    )

    backgroundTaskRunner(async () => {
      try {
        await sendVerificationCodeEmail({ locale, email, code })
      } catch (error) {
        captureException(error)
        // The email is deliberately absent: core has no masking helper, and
        // the address must not reach the logs in clear (captureException
        // already carries the full context to Sentry).
        logger.error('Failed to send verification code email', { error })
      }
    })

    // The code itself must not leave the service: only the caller-facing
    // fields of the stored row are returned.
    return {
      email: verificationCode.email,
      expirationDate: verificationCode.expirationDate,
    }
  }
}
