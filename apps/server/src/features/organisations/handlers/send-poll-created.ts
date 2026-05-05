import { sendPollCreatedEmail } from '../../../adapters/brevo/client.ts'
import type { Handler } from '../../../core/event-bus/handler.ts'
import type { PollCreatedEvent } from '../events/PollCreated.event.ts'

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
