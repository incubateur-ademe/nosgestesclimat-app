import { addOrUpdateContactAfterLogin } from '../../../adapters/brevo/client.ts'
import type { Handler } from '../../../core/event-bus/handler.ts'
import type { LoginEvent } from '../events/Login.event.ts'

export const updateBrevoContact: Handler<LoginEvent> = ({
  attributes: {
    user: { email, id: userId },
  },
}) => {
  return addOrUpdateContactAfterLogin({ email, userId })
}
