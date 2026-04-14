import { sendPollCreatedEmail } from '../../../adapters/brevo/client.js'
import type { Handler } from '../../../core/event-bus/handler.js'
import type { PollCreatedEvent } from '../events/PollCreated.event.js'

export const sendPollCreated: Handler<PollCreatedEvent> = (event) => {
  const {
    attributes: {
      poll,
      locale,
      origin,
      organisation,
      organisation: {
        administrators: [{ user: administrator }],
      },
    },
  } = event

  return sendPollCreatedEmail({
    administrator,
    organisation,
    origin,
    locale,
    poll,
  })
}
