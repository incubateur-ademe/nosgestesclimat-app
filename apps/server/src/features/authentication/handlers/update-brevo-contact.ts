import { addOrUpdateContactAfterLogin } from '../../../adapters/brevo/client.js'
import type { Handler } from '../../../core/event-bus/handler.js'
import type { LoginEvent } from '../events/Login.event.js'

export const updateBrevoContact: Handler<LoginEvent> = ({
  attributes: {
    user: { email, id: userId },
  },
}) => {
  return addOrUpdateContactAfterLogin({ email, userId })
}
