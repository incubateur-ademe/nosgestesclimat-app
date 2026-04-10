import { StatusCodes } from 'http-status-codes'
import type { JsonBodyType } from 'msw'
import { http, HttpResponse } from 'msw'
import { expect } from 'vitest'

type CustomResponse = {
  body?: JsonBodyType
  status?: number
}

export const twoTonsExportSituation = ({
  customResponses,
  expectBody,
  networkError,
  expectParams,
}: {
  customResponses?: CustomResponse[]
  networkError?: true
  expectBody?: unknown
  expectParams?: unknown
} = {}) =>
  http.post(
    `${process.env.TWO_TONS_URL}/api/v1/ngc-carbon-form-answers`,
    async ({ request }) => {
      if (
        request.headers.get('authorization') !==
        `Bearer ${process.env.TWO_TONS_BEARER_TOKEN}`
      ) {
        return HttpResponse.text('', { status: StatusCodes.UNAUTHORIZED })
      }

      if (expectParams) {
        expect(
          Object.fromEntries(new URL(request.url).searchParams.entries())
        ).toEqual(expectParams)
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
