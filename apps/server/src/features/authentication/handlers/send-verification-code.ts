import { sendVerificationCodeEmail } from '../../../adapters/brevo/client.js'
import type { Handler } from '../../../core/event-bus/handler.js'
import type { VerificationCodeCreatedEvent } from '../events/VerificationCodeCreated.event.js'

export const sendVerificationCode: Handler<VerificationCodeCreatedEvent> = ({
  attributes: {
    verificationCode: { code, email },
    locale,
  },
}) =>
  sendVerificationCodeEmail({
    locale,
    email,
    code,
  })
