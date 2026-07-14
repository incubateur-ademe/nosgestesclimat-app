import { sendWelcomeEmail } from '../../../adapters/brevo/client.ts'
import { VerificationCodeMode } from '../../../adapters/prisma/generated.ts'
import { config } from '../../../config.ts'
import type { Handler } from '../../../core/event-bus/handler.ts'
import type { LoginEvent } from '../events/Login.event.ts'

export const sendBrevoWelcomeEmail: Handler<LoginEvent> = ({
  attributes: {
    user: { email },
    mode,
    locale,
  },
}) => {
  if (mode === VerificationCodeMode.signUp) {
    return sendWelcomeEmail({ email, origin: config.app.origin, locale })
  }
}
