import { StatusCodes } from 'http-status-codes'
import type { JsonBodyType } from 'msw'
import { http, HttpResponse } from 'msw'
import { expect } from 'vitest'
import { PosthogEndpoint } from '../../constant.ts'

type CustomResponse = {
  body?: JsonBodyType
  status?: number
}

export const posthogRunEndpoint = ({
  endpoint = PosthogEndpoint.northstarStats,
  expectBody,
  customResponses,
  networkError,
}: {
  endpoint?: string
  expectBody?: unknown
  customResponses?: CustomResponse[]
  networkError?: true
} = {}) =>
  http.post(
    `${process.env.POSTHOG_URL}/api/projects/${process.env.POSTHOG_PROJECT_ID}/endpoints/${endpoint}/run`,
    async ({ request }) => {
      if (
        request.headers.get('authorization') !==
        `Bearer ${process.env.POSTHOG_PERSONAL_API_KEY}`
      ) {
        return HttpResponse.text('', { status: StatusCodes.UNAUTHORIZED })
      }

      if (expectBody) {
        expect(await request.json()).toEqual(expectBody)
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
