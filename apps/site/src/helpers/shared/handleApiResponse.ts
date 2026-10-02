import {
  ForbiddenError,
  InternalServerError,
  InvalidInputError,
  NotFoundError,
  TooManyRequestsError,
  UnauthorizedError,
  UnknownError,
} from '@/helpers/server/error'

export async function handleApiResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T
  }

  if (!response.ok) {
    const body = await response.text()
    let parsedBody: unknown = body
    try {
      parsedBody = JSON.parse(body)
    } catch {
      // use raw body
    }

    switch (response.status) {
      case 404:
        throw new NotFoundError()
      case 401:
        throw new UnauthorizedError()
      case 403:
        throw new ForbiddenError()
      case 429:
        throw new TooManyRequestsError()
      case 400: {
        throw new InvalidInputError(parsedBody)
      }
      case 202:
        return await (response.json() as Promise<T>)
      case 500:
        throw new InternalServerError()
      default:
        throw new UnknownError(response.status, body)
    }
  }

  return await (response.json() as Promise<T>)
}
