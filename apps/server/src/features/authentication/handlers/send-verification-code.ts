import { maskEmail } from '@nosgestesclimat/core/lib/pii'
import { sendVerificationCodeEmail } from '../../../adapters/brevo/client.ts'
import type { Handler } from '../../../core/event-bus/handler.ts'
import logger from '../../../logger.ts'
import type { VerificationCodeCreatedEvent } from '../events/VerificationCodeCreated.event.ts'

export const sendVerificationCode: Handler<VerificationCodeCreatedEvent> =
  async ({
    attributes: {
      verificationCode: { code, email },
      locale,
    },
  }) => {
    const startedAt = Date.now()
    const response = await sendVerificationCodeEmail({
      locale,
      email,
      code,
    })

    // Distinguishes "code created but never delivered" from "code created and
    // delivered": a failure to reach Brevo still surfaces as a 500 on creation.
    logger.info('VerificationCode email sent', {
      email: maskEmail(email),
      locale,
      messageId: (response.data as { messageId?: string } | undefined)
        ?.messageId,
      durationMs: Date.now() - startedAt,
    })

    return response
  }
