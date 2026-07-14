import { sendOrganisationCreatedEmail } from '../../../adapters/brevo/client.ts'
import { config } from '../../../config.ts'
import type { Handler } from '../../../core/event-bus/handler.ts'
import type { OrganisationCreatedEvent } from '../events/OrganisationCreated.event.ts'

export const sendOrganisationCreated: Handler<OrganisationCreatedEvent> = ({
  attributes,
}) =>
  sendOrganisationCreatedEmail({ ...attributes, origin: config.app.origin })
