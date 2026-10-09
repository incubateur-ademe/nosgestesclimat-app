import { randomInt } from 'node:crypto'

import type { BackgroundTaskRunner } from '../../../lib/background-task-runner.ts'
import type { VerificationCodeUsage } from '../../../prisma/generated/client.ts'
import type { SendEmail } from '../../emails/types.ts'
import type { ISOSupportedLanguage } from '../../geo/types/language.ts'
import type { CaptureException, Logger } from '../../logger/index.ts'
import { createVerificationCodeEmail } from '../emails/auth-emails.ts'
import { createVerificationCode as createVerificationCodeRepository } from '../repositories/verification-codes.repository.ts'

interface CreateVerificationCodeDependencies {
  logger: Logger
  captureException: CaptureException
  sendEmail: SendEmail
  /** Runs the email outside of the request lifecycle */
  backgroundTaskRunner: BackgroundTaskRunner
  /** What the created code unlocks */
  usage: VerificationCodeUsage
  /** Code generator, overridable by tests that need to know the code */
  generateCode?: () => string
}

const VERIFICATION_CODE_TTL_MS = 60 * 60 * 1000 // 1 hour

export function createCreateVerificationCodeService({
  logger,
  captureException,
  sendEmail,
  backgroundTaskRunner,
  usage,
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

    await createVerificationCodeRepository({
      email,
      code,
      expirationDate,
      usage,
    })

    backgroundTaskRunner(async () => {
      const result = await sendEmail(
        createVerificationCodeEmail({ locale, email, code })
      )
      if (!result.success) {
        captureException(result.error)
        logger.error('Failed to send verification code email', {
          error: result.error,
        })
      }
    })

    // The code itself must not leave the service: only the caller-facing
    // fields of the stored row are returned.
    return {
      email,
      expirationDate,
    }
  }
}

export const generateRandomVerificationCode = () =>
  randomInt(100_000, 1_000_000).toString()
