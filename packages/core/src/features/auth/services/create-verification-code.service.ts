import { randomInt } from 'node:crypto'

import type { BackgroundTaskRunner } from '../../../lib/background-task-runner.ts'
import { prisma } from '../../../prisma/client.ts'
import { VerificationCodeUsage } from '../../../prisma/generated/client.ts'
import type { SendEmail } from '../../emails/types.ts'
import type { ISOSupportedLanguage } from '../../geo/types/language.ts'
import type { CaptureException, Logger } from '../../logger/index.ts'
import { createVerificationCodeEmail } from '../emails/auth-emails.ts'
import { createUserVerificationCode } from '../repositories/verification-codes.repository.ts'

interface CreateVerificationCodeDependencies {
  logger: Logger
  captureException: CaptureException
  sendEmail: SendEmail
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
  sendEmail,
  backgroundTaskRunner,
  usage = VerificationCodeUsage.login,
  generateCode = generateRandomVerificationCode,
}: CreateVerificationCodeDependencies) {
  return async function createVerificationCode({
    email,
    locale,
  }: {
    email: string
    locale: ISOSupportedLanguage
  }): Promise<{ email: string; expirationDate: Date }> {
    const code = generateCode()
    const expirationDate = new Date(Date.now() + VERIFICATION_CODE_TTL_MS)

    // The code must be committed *before* the email is handed to Brevo.
    // Otherwise Brevo may accept — and deliver — a code that does not exist
    // in database, and every attempt to use it comes back as "invalid". The
    // row is created with a plain committed create, and only then is the
    // email scheduled through the backgroundTaskRunner.
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
      const result = await sendEmail(
        createVerificationCodeEmail({ locale, email, code })
      )
      if (!result.success) {
        captureException(result.error)
        // The email is deliberately absent: core has no masking helper, and
        // the address must not reach the logs in clear (captureException
        // already carries the full context to Sentry).
        logger.error('Failed to send verification code email', {
          error: result.error,
        })
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
