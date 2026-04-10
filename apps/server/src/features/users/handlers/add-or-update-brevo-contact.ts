import { addOrUpdateContact } from '../../../adapters/brevo/client.js'
import { Attributes } from '../../../adapters/brevo/constant.js'
import type { Handler } from '../../../core/event-bus/handler.js'
import type { UserUpdatedEvent } from '../events/UserUpdated.event.js'

export const addOrUpdateBrevoContact: Handler<UserUpdatedEvent> = async ({
  attributes: {
    user: { email, ...user },
    verified,
  },
}) => {
  if (!verified || !email) {
    return
  }

  await addOrUpdateContact({
    email,
    attributes: {
      [Attributes.USER_ID]: user.id,
      [Attributes.PRENOM]: user.name,
    },
  })
}
