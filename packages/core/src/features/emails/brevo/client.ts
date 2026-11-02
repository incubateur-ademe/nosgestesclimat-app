import { Attributes } from '../email.constant.ts'
import type {
  AddOrUpdateContact,
  ResetUserProperties,
  SendEmail,
} from '../types.ts'
import { createPost, createPut } from './http.ts'
import type { BrevoConfig } from './types.ts'

export const createBrevoClient = (
  config: BrevoConfig
): {
  sendEmail: SendEmail
  addOrUpdateContact: AddOrUpdateContact
  resetUserProperties: ResetUserProperties
} => {
  const post = createPost(config)
  const put = createPut(config)

  const sendEmail: SendEmail = ({ email, templateId, params }) =>
    post(
      '/v3/smtp/email',
      {
        to: [
          {
            name: email,
            email,
          },
        ],
        templateId,
        params,
      },
      {
        // A client-side timeout only aborts our socket: Brevo has already received
        // the request and will still deliver the email. Setting a timeout below Brevo's
        // response time, turns single sends into timeouts and with retries, into duplicate emails.
        timeout: 10_000,
        // Lower than the default for the same reason: a retried send
        // is a duplicate email whenever the previous attempt actually got through.
        retries: 1,
      }
    )

  const addOrUpdateContact: AddOrUpdateContact = ({
    email,
    listIds,
    attributes,
  }) =>
    post('/v3/contacts', {
      email,
      listIds,
      attributes,
      updateEnabled: true,
    })

  const resetUserProperties: ResetUserProperties = ({ email }) =>
    put(`/v3/contacts/${encodeURIComponent(email)}`, {
      // Brevo clears an attribute value when it is set to null.
      attributes: Object.fromEntries(
        Object.values(Attributes).map((attribute) => [attribute, null])
      ),
    })

  return {
    sendEmail,
    addOrUpdateContact,
    resetUserProperties,
  }
}
