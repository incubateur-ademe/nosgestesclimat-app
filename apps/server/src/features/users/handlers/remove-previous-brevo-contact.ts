import { deleteContact } from '../../../adapters/brevo/client.js'
import type { Handler } from '../../../core/event-bus/handler.js'
import type { UserUpdatedEvent } from '../events/UserUpdated.event.js'

export const removePreviousBrevoContact: Handler<UserUpdatedEvent> = ({
  attributes: { previousContact, verified },
}) => {
  if (!verified || !previousContact) {
    return
  }

  return deleteContact(previousContact.email)
}
