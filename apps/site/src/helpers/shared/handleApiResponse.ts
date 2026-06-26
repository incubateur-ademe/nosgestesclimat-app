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
  if (!response.ok) {
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
        const text = await response.text()
        let error: unknown
        try {
          error = JSON.parse(text)
        } catch {
          error = text
        }
        throw new InvalidInputError(error)
      }
      case 202:
        return response.json() as Promise<T>
      case 500:
        throw new InternalServerError()
      default:
        throw new UnknownError(response.status, await response.text())
    }
  }

  return response.json() as Promise<T>
}
