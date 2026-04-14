import { StatusCodes } from 'http-status-codes'
import type { JsonBodyType } from 'msw'
import { http, HttpResponse } from 'msw'
import { expect } from 'vitest'

type CustomResponse = {
  body?: JsonBodyType
  status?: number
}

export const agirExportSituation = ({
  customResponses,
  expectBody,
  networkError,
}: {
  customResponses?: CustomResponse[]
  networkError?: true
  expectBody?: unknown
} = {}) =>
  http.post(
    `${process.env.AGIR_URL}/bilan/importFromNGC`,
    async ({ request }) => {
      if (request.headers.get('apikey') !== process.env.AGIR_API_KEY) {
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
