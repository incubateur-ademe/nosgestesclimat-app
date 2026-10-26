import * as v from 'valibot'
import { failure, success, type Result } from '../../../lib/result.ts'
import { isNewsletterList } from '../email.constant.ts'
import { EmailRequestError } from '../errors.ts'
import type { AddOrUpdateContact, EraseContact, SendEmail } from '../types.ts'
import { createGet, createPost, createPut } from './http.ts'
import type { BrevoConfig } from './types.ts'

const BrevoContactSchema = v.object({
  attributes: v.nullish(v.record(v.string(), v.unknown()), {}),
  listIds: v.nullish(v.array(v.number()), []),
})

type BrevoContact = v.InferOutput<typeof BrevoContactSchema>

// Only the address survives: the newsletter consent is given with it, and every
// other attribute is tied to the account.
const KeptAttributes = new Set(['EMAIL'])

export const createBrevoClient = (
  config: BrevoConfig
): {
  sendEmail: SendEmail
  addOrUpdateContact: AddOrUpdateContact
  eraseContact: EraseContact
} => {
  const get = createGet(config)
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

  const fetchContact = async (
    email: string
  ): Promise<Result<BrevoContact | null, EmailRequestError>> => {
    const result = await get(`/v3/contacts/${encodeURIComponent(email)}`, {
      tolerateStatuses: [404],
    })

    if (!result.success) {
      return result
    }

    if (result.data.status === 404) {
      // Draining the body releases the connection.
      await result.data.text()
      return success(null)
    }

    try {
      return success(v.parse(BrevoContactSchema, await result.data.json()))
    } catch (error) {
      return failure(
        new EmailRequestError('Brevo contact is not valid', { cause: error })
      )
    }
  }

  // Brevo erases an attribute when the update sends an empty value. The
  // behaviour is documented for imports only (emptyContactsAttributes):
  // https://developers.brevo.com/reference/import-contacts
  const eraseContact: EraseContact = async ({ email }) => {
    const contact = await fetchContact(email)

    if (!contact.success) {
      return contact
    }

    if (!contact.data) {
      return success()
    }

    const { attributes, listIds } = contact.data

    return put(
      `/v3/contacts/${encodeURIComponent(email)}`,
      {
        attributes: Object.fromEntries(
          Object.keys(attributes)
            .filter((attribute) => !KeptAttributes.has(attribute))
            .map((attribute) => [attribute, ''])
        ),
        unlinkListIds: listIds.filter((listId) => !isNewsletterList(listId)),
      },
      {
        // The contact may have been deleted between the read and the update.
        tolerateStatuses: [404],
      }
    )
  }

  return {
    sendEmail,
    addOrUpdateContact,
    eraseContact,
  }
}
