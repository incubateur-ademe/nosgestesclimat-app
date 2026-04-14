import { StatusCodes } from 'http-status-codes'
import { http, HttpResponse } from 'msw'
import { expect } from 'vitest'
import { baseURL } from '../../client.js'

export const connectUpdateContact = ({
  expectBody,
}: {
  expectBody?: unknown
} = {}) =>
  http.post(`${baseURL}/api/v1/personnes`, async ({ request }) => {
    if (
      request.headers.get('client_id') !== process.env.CONNECT_CLIENT_ID ||
      request.headers.get('client_secret') !== process.env.CONNECT_CLIENT_SECRET
    ) {
      return HttpResponse.text('', { status: StatusCodes.UNAUTHORIZED })
    }

    if (expectBody) {
      expect(await request.json()).toEqual(expectBody)
    }

    return HttpResponse.json()
  })
