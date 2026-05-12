import { sendWelcomeEmail } from '../../../adapters/brevo/client.ts'
import { VerificationCodeMode } from '../../../adapters/prisma/generated.ts'
import type { Handler } from '../../../core/event-bus/handler.ts'
import type { LoginEvent } from '../events/Login.event.ts'

export const sendBrevoWelcomeEmail: Handler<LoginEvent> = ({
  attributes: {
    user: { email },
    mode,
    locale,
    origin,
  },
}) => {
  if (mode === VerificationCodeMode.signUp) {
    return sendWelcomeEmail({ email, origin, locale })
  }
}
