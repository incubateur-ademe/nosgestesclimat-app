import { sendOrganisationCreatedEmail } from '../../../adapters/brevo/client.js'
import type { Handler } from '../../../core/event-bus/handler.js'
import type { OrganisationCreatedEvent } from '../events/OrganisationCreated.event.js'

export const sendOrganisationCreated: Handler<OrganisationCreatedEvent> = ({
  attributes,
}) => sendOrganisationCreatedEmail(attributes)
