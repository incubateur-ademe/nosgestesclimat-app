import { afterEach, describe, expect, it, vi } from 'vitest'
import { Attributes, ListIds } from '../../email.constant.ts'
import { createBrevoClient } from '../client.ts'

const client = createBrevoClient({
  url: 'https://brevo.test',
  apiKey: 'api-key',
})

type ResponseSpec = { status: number; body?: unknown }

const responseOf = ({ status, body }: ResponseSpec) => ({
  ok: status >= 200 && status < 300,
  status,
  json: () => Promise.resolve(body),
  text: () => Promise.resolve(body === undefined ? '' : JSON.stringify(body)),
})

const mockFetch = (...responses: ResponseSpec[]) => {
  const fetchMock = vi.fn((_url: string, _init?: RequestInit) =>
    responseOf(responses.shift()!)
  )
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

const contact = {
  attributes: {
    EMAIL: 'jane@example.com',
    USER_ID: 'user-1',
    PRENOM: 'Jane',
    [Attributes.LAST_SIMULATION_BILAN_FOOTPRINT]: 1234,
    MANUALLY_ADDED: 'some value',
  },
  listIds: [
    ListIds.MAIN_NEWSLETTER,
    ListIds.ORGANISATIONS,
    ListIds.GROUP_JOINED,
    999,
  ],
}

const requestOf = (fetchMock: ReturnType<typeof mockFetch>, call: number) => {
  const [url, init] = fetchMock.mock.calls[call]
  return {
    url,
    init,
    body: init?.body ? JSON.parse(String(init.body)) : undefined,
  }
}

describe('eraseContact', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('erases every attribute the contact carries except its address', async () => {
    const fetchMock = mockFetch({ status: 200, body: contact }, { status: 204 })

    const result = await client.eraseContact({ email: 'jane@example.com' })

    expect.assert(result.success)

    const read = requestOf(fetchMock, 0)
    expect(read.init?.method).toBe('GET')
    expect(read.url).toBe('https://brevo.test/v3/contacts/jane%40example.com')

    const update = requestOf(fetchMock, 1)
    expect(update.init?.method).toBe('PUT')
    expect(update.body.attributes).toEqual({
      USER_ID: '',
      PRENOM: '',
      [Attributes.LAST_SIMULATION_BILAN_FOOTPRINT]: '',
      MANUALLY_ADDED: '',
    })
  })

  it('unlinks every list that is not a newsletter', async () => {
    const fetchMock = mockFetch({ status: 200, body: contact }, { status: 204 })

    await client.eraseContact({ email: 'jane@example.com' })

    const { body } = requestOf(fetchMock, 1)
    expect(body.unlinkListIds).toEqual([
      ListIds.ORGANISATIONS,
      ListIds.GROUP_JOINED,
      999,
    ])
    expect(body.listIds).toBeUndefined()
  })

  it('treats a contact that does not exist as erased', async () => {
    const fetchMock = mockFetch({ status: 404 })

    const result = await client.eraseContact({ email: 'gone@example.com' })

    expect.assert(result.success)
    expect(fetchMock).toHaveBeenCalledOnce()
  })

  it('does not update the contact when the read fails', async () => {
    const fetchMock = mockFetch({
      status: 400,
      body: { code: 'invalid_parameter' },
    })

    const result = await client.eraseContact({ email: 'jane@example.com' })

    expect.assert(!result.success)
    expect(fetchMock).toHaveBeenCalledOnce()
  })

  it('reports a failure when Brevo refuses the update', async () => {
    mockFetch(
      { status: 200, body: contact },
      { status: 400, body: { code: 'invalid_parameter' } }
    )

    const result = await client.eraseContact({ email: 'jane@example.com' })

    expect.assert(!result.success)
    expect(result.error.code).toBe('email_request_error')
  })
})
