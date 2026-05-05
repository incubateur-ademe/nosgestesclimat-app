import { addOrUpdateContact } from '../../../adapters/brevo/client.ts'
import { Attributes } from '../../../adapters/brevo/constant.ts'
import type { Handler } from '../../../core/event-bus/handler.ts'
import type { UserUpdatedEvent } from '../events/UserUpdated.event.ts'

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
