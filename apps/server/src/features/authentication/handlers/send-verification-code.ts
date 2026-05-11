import { sendVerificationCodeEmail } from '../../../adapters/brevo/client.ts'
import type { Handler } from '../../../core/event-bus/handler.ts'
import type { VerificationCodeCreatedEvent } from '../events/VerificationCodeCreated.event.ts'

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
