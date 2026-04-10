import {
  sendGroupCreatedEmail,
  sendGroupParticipantSimulationUpsertedEmail,
  sendPollSimulationUpsertedEmail,
  sendSimulationUpsertedEmail,
} from '../../../adapters/brevo/client.js'
import type { Handler } from '../../../core/event-bus/handler.js'
import type { SimulationUpsertedEvent } from '../events/SimulationUpserted.event.js'

export const sendSimulationUpserted: Handler<SimulationUpsertedEvent> = ({
  attributes,
  attributes: {
    origin,
    user,
    organisation,
    simulation,
    sendEmail,
    verified,
    locale,
    poll,
  },
}) => {
  if (!user.email || !sendEmail) {
    return
  }

  const { email } = user

  if (simulation?.progression === 1) {
    if (organisation) {
      return sendPollSimulationUpsertedEmail({
        organisation,
        simulation,
        locale,
        origin,
        email,
        poll,
      })
    }

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
