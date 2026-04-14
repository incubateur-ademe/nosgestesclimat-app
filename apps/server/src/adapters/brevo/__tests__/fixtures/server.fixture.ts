import { StatusCodes } from 'http-status-codes'
import type { JsonBodyType } from 'msw'
import { delay, http, HttpResponse } from 'msw'
import { expect } from 'vitest'

type CustomResponse = {
  body?: JsonBodyType
  status?: number
}

export const brevoSendEmail = ({
  expectBody,
}: {
  expectBody?: unknown
} = {}) =>
  http.post(`${process.env.BREVO_URL}/v3/smtp/email`, async ({ request }) => {
    if (request.headers.get('api-key') !== process.env.BREVO_API_KEY) {
      return HttpResponse.text('', { status: StatusCodes.UNAUTHORIZED })
    }

    if (expectBody) {
      expect(await request.json()).toEqual(expectBody)
    }

    return HttpResponse.json()
  })

export const brevoUpdateContact = ({
  customResponses,
  networkError,
  expectBody,
  storeBodies,
}:
  | {
      customResponses?: CustomResponse[]
      expectBody?: unknown
      storeBodies?: undefined
      networkError?: true
    }
  | {
      customResponses?: CustomResponse[]
      expectBody?: undefined
      storeBodies?: unknown[]
      networkError?: true
    } = {}) =>
  http.post(`${process.env.BREVO_URL}/v3/contacts`, async ({ request }) => {
    if (request.headers.get('api-key') !== process.env.BREVO_API_KEY) {
      return HttpResponse.text('', { status: StatusCodes.UNAUTHORIZED })
    }

    if (expectBody) {
      expect(await request.json()).toEqual(expectBody)
    }

    if (storeBodies) {
      storeBodies.push(await request.json())
    }

    if (networkError) {
      return HttpResponse.error()
    }

    const customResponse = customResponses?.shift()

    return customResponse
      ? HttpResponse.json(customResponse.body, {
          status: customResponse.status || StatusCodes.OK,
        })
      : HttpResponse.json()
  })

export const brevoRemoveFromList = (
  listId: number,
  {
    expectBody,
    invalid,
  }: {
    expectBody?: unknown
    invalid?: true
  } = {}
) =>
  http.post(
    `${process.env.BREVO_URL}/v3/contacts/lists/${listId}/contacts/remove`,
    async ({ request }) => {
      if (request.headers.get('api-key') !== process.env.BREVO_API_KEY) {
        return HttpResponse.text('', { status: StatusCodes.UNAUTHORIZED })
      }

      if (expectBody) {
        expect(await request.json()).toEqual(expectBody)
      }

      return invalid
        ? HttpResponse.json(
            {
              code: 'invalid_parameter',
            },
            {
              status: StatusCodes.BAD_REQUEST,
            }
          )
        : HttpResponse.json()
    }
  )

export const brevoGetContact = (
  email: string,
  {
    customResponses,
    networkError,
  }: { customResponses?: CustomResponse[]; networkError?: true } = {}
) =>
  http.get(
    `${process.env.BREVO_URL}/v3/contacts/${encodeURIComponent(email)}`,
    ({ request }) => {
      if (request.headers.get('api-key') !== process.env.BREVO_API_KEY) {
        return HttpResponse.text('', { status: StatusCodes.UNAUTHORIZED })
      }

      if (networkError) {
        return HttpResponse.error()
      }

      const customResponse = customResponses?.shift()

      return customResponse
        ? HttpResponse.json(customResponse.body, {
            status: customResponse.status || StatusCodes.OK,
          })
        : HttpResponse.json()
    }
  )

export const brevoDeleteContact = (
  email: string,
  {
    customResponses,
    networkError,
  }: { customResponses?: CustomResponse[]; networkError?: true } = {}
) =>
  http.delete(
    `${process.env.BREVO_URL}/v3/contacts/${encodeURIComponent(email)}`,
    ({ request }) => {
      if (request.headers.get('api-key') !== process.env.BREVO_API_KEY) {
        return HttpResponse.text('', { status: StatusCodes.UNAUTHORIZED })
      }

      if (networkError) {
        return HttpResponse.error()
      }

      const customResponse = customResponses?.shift()

      return customResponse
        ? HttpResponse.json(customResponse.body, {
            status: customResponse.status || StatusCodes.OK,
          })
        : HttpResponse.json()
    }
  )

export const brevoGetNewsletter = (
  newsletterId: string,
  {
    customResponses,
    networkError,
    delayInMs,
  }: {
    customResponses?: CustomResponse[]
    networkError?: true
    delayInMs?: number | 'random'
  } = {}
) =>
  http.get(
    `${process.env.BREVO_URL}/v3/contacts/lists/${newsletterId}`,
    async ({ request }) => {
      if (request.headers.get('api-key') !== process.env.BREVO_API_KEY) {
        return HttpResponse.text('', { status: StatusCodes.UNAUTHORIZED })
      }

      if (delayInMs) {
        await (delayInMs === 'random' ? delay() : delay(delayInMs))
      }

      if (networkError) {
        return HttpResponse.error()
      }

      const customResponse = customResponses?.shift()

      return customResponse
        ? HttpResponse.json(customResponse.body, {
            status: customResponse.status || StatusCodes.OK,
          })
        : HttpResponse.json()
    }
  )
