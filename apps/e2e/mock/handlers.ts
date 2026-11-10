import type { JsonBodyType } from 'msw'
import { http, HttpResponse } from 'msw'
import {
  deleteContact,
  findContact,
  updateContact,
  upsertContact,
} from './contacts.ts'
import { clearEmails, findEmails, storeEmail } from './mailbox.ts'

const json = (data: JsonBodyType, status = 200) =>
  HttpResponse.json(data, { status })
const noContent = () => new HttpResponse(null, { status: 204 })

export const handlers = [
  // Brevo — transactional send, captured for the local mailbox.
  http.post('/v3/smtp/email', async ({ request }) => {
    const body = (await request.json()) as {
      to?: { email?: string }[]
      templateId?: number
      params?: Record<string, unknown>
    }
    storeEmail({
      to: body.to?.[0]?.email,
      templateId: body.templateId,
      params: body.params,
    })
    return json({ messageId: `<e2e.${Date.now()}@mock>` }, 201)
  }),

  // Local mailbox, read by the StubMailbox adapter.
  http.get('/emails', ({ request }) => {
    const [, query = ''] = request.url.split('?')
    const params = new URLSearchParams(query)
    return json(
      findEmails({
        to: params.get('to'),
        templateId: params.get('templateId'),
      })
    )
  }),
  http.delete('/emails', () => {
    clearEmails()
    return noContent()
  }),

  // Brevo — contacts, stored so that a read sees what the flow wrote before it.
  http.post('/v3/contacts', async ({ request }) => {
    upsertContact((await request.json()) as Parameters<typeof upsertContact>[0])
    return json({}, 201)
  }),
  http.get('/v3/contacts/:email', ({ params }) => {
    const contact = findContact(decodeURIComponent(String(params.email)))

    return contact ? json(contact) : json({ code: 'document_not_found' }, 404)
  }),
  http.put('/v3/contacts/:email', async ({ params, request }) => {
    // The path names the contact; the body carries what changes.
    const body = (await request.json()) as Omit<
      Parameters<typeof updateContact>[0],
      'email'
    >
    const updated = updateContact({
      ...body,
      email: decodeURIComponent(String(params.email)),
    })

    return updated ? noContent() : json({ code: 'document_not_found' }, 404)
  }),
  http.delete('/v3/contacts/:email', ({ params }) =>
    deleteContact(decodeURIComponent(String(params.email)))
      ? noContent()
      : json({ code: 'document_not_found' }, 404)
  ),
  http.post('/v3/contacts/lists/:id/contacts/remove', () => noContent()),
  http.get('/v3/contacts/lists/:id', () => json({ id: 1, name: 'e2e' })),
]
