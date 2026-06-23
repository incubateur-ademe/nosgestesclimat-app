import { sendVerificationCodeEmail } from '../../../adapters/brevo/client.ts'
import type { Handler } from '../../../core/event-bus/handler.ts'
import logger from '../../../logger.ts'
import type { VerificationCodeCreatedEvent } from '../events/VerificationCodeCreated.event.ts'

export const sendVerificationCode: Handler<VerificationCodeCreatedEvent> = ({
  attributes: {
    verificationCode: { code, email },
    locale,
  },
}) =>
  // The caller emits this event fire-and-forget, so delivery failures are not
  // surfaced to the request. Log them here to keep them observable.
  sendVerificationCodeEmail({
    locale,
    email,
    code,
  }).catch((err) => {
    logger.error('VerificationCode email sending failed', err)
  })
