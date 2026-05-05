import { deleteContact } from '../../../adapters/brevo/client.ts'
import type { Handler } from '../../../core/event-bus/handler.ts'
import type { UserUpdatedEvent } from '../events/UserUpdated.event.ts'

export const removePreviousBrevoContact: Handler<UserUpdatedEvent> = ({
  attributes: { previousContact, verified },
}) => {
  if (!verified || !previousContact) {
    return
  }

  return deleteContact(previousContact.email)
}
