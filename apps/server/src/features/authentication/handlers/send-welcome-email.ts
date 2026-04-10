import { VerificationCodeMode } from '../../../adapters/prisma/generated.js'
import { sendWelcomeEmail } from '../../../adapters/brevo/client.js'
import type { Handler } from '../../../core/event-bus/handler.js'
import type { LoginEvent } from '../events/Login.event.js'

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
