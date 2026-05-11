import { addOrUpdateContact } from '../../../adapters/connect/client.ts'
import type { Handler } from '../../../core/event-bus/handler.ts'
import type { OrganisationCreatedEvent } from '../events/OrganisationCreated.event.ts'
import type { OrganisationUpdatedEvent } from '../events/OrganisationUpdated.event.ts'

export const addOrUpdateConnectContact: Handler<
  OrganisationCreatedEvent | OrganisationUpdatedEvent
> = ({ attributes }) =>
  attributes.administrator && addOrUpdateContact(attributes.administrator)
