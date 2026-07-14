import { sendPollCreatedEmail } from '../../../adapters/brevo/client.ts'
import { config } from '../../../config.ts'
import type { Handler } from '../../../core/event-bus/handler.ts'
import type { PollCreatedEvent } from '../events/PollCreated.event.ts'

export const sendPollCreated: Handler<PollCreatedEvent> = (event) => {
  const {
    attributes: {
      poll,
      locale,
      organisation,
      organisation: {
        administrators: [{ user: administrator }],
      },
    },
  } = event

  return sendPollCreatedEmail({
    administrator,
    organisation,
    origin: config.app.origin,
    locale,
    poll,
  })
}
