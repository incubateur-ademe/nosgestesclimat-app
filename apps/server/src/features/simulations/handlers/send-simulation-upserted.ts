import {
  sendGroupCreatedEmail,
  sendGroupParticipantSimulationUpsertedEmail,
  sendPollSimulationUpsertedEmail,
} from '../../../adapters/brevo/client.ts'
import type { Handler } from '../../../core/event-bus/handler.ts'
import type { SimulationUpsertedEvent } from '../events/SimulationUpserted.event.ts'

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

  if (simulation?.progression !== 1) return

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
