import {
  sendGroupCreatedEmail,
  sendGroupParticipantSimulationUpsertedEmail,
  sendSimulationUpsertedEmail,
} from '../../../adapters/brevo/client.ts'
import { config } from '../../../config.ts'
import type { Handler } from '../../../core/event-bus/handler.ts'
import type { SimulationUpsertedEvent } from '../events/SimulationUpserted.event.ts'

export const sendSimulationUpserted: Handler<SimulationUpsertedEvent> = ({
  attributes,
  attributes: { user, simulation, sendEmail, verified, locale },
}) => {
  if (!user.email || !sendEmail) {
    return
  }

  const { email } = user
  const origin = config.app.origin

  if (simulation?.progression === 1) {
    if (attributes.group) {
      const { user, administrator, group } = attributes
      const isAdministrator = user.id === administrator.id
      const params = {
        group,
        origin,
        user,
      }

      return isAdministrator
        ? // @ts-expect-error sometimes control-flow is broken
          sendGroupCreatedEmail(params)
        : // @ts-expect-error sometimes control-flow is broken
          sendGroupParticipantSimulationUpsertedEmail(params)
    }
  }

  return sendSimulationUpsertedEmail({
    email,
    origin,
    locale,
    simulation,
    verified: !!verified,
  })
}
