import { addOrUpdateContact } from '../../../adapters/connect/client.js'
import type { Handler } from '../../../core/event-bus/handler.js'
import type { OrganisationCreatedEvent } from '../events/OrganisationCreated.event.js'
import type { OrganisationUpdatedEvent } from '../events/OrganisationUpdated.event.js'

export const addOrUpdateConnectContact: Handler<
  OrganisationCreatedEvent | OrganisationUpdatedEvent
> = ({ attributes }) =>
  attributes.administrator && addOrUpdateContact(attributes.administrator)
