import { failure, success } from '../../../lib/result.ts'
import { EmailRequestError } from '../errors.ts'
import type { BrevoConfig, RequestOptions } from './types.ts'

const DEFAULT_TIMEOUT = 5_000
const DEFAULT_RETRIES = 2
const RETRY_DELAY = 200

const wait = (delay: number) =>
  new Promise((resolve) => setTimeout(resolve, delay))

// Brevo is only worth retrying when the request never got a verdict: a network
// failure, a timeout, or a server error. Everything else is a client error we
// would just replay.
const isRetryableStatus = (status: number) => status >= 500 && status <= 599

const isRetryableError = (error: unknown) =>
  error instanceof TypeError ||
  (error instanceof Error &&
    (error.name === 'TimeoutError' || error.name === 'AbortError'))

export const createPost =
  ({ url, apiKey }: BrevoConfig) =>
  async (
    path: string,
    body: unknown,
    {
      timeout = DEFAULT_TIMEOUT,
      retries = DEFAULT_RETRIES,
    }: RequestOptions = {}
  ) => {
    const endpoint = `${url.replace(/\/$/, '')}${path}`

    for (let attempt = 0; ; attempt++) {
      let response: Response

      try {
        response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'api-key': apiKey,
            'content-type': 'application/json',
          },
          body: JSON.stringify(body),
          // Each attempt gets a fresh timeout, like axios-retry shouldResetTimeout.
          signal: AbortSignal.timeout(timeout),
        })
      } catch (error) {
        if (attempt < retries && isRetryableError(error)) {
          await wait(RETRY_DELAY)
          continue
        }

        return failure(
          new EmailRequestError(`Brevo request to ${path} failed`, {
            cause: error,
          })
        )
      }

      if (response.ok) {
        return success()
      }

      const responseBody = await response.text()

      if (attempt < retries && isRetryableStatus(response.status)) {
        await wait(RETRY_DELAY)
        continue
      }

      return failure(
        new EmailRequestError(
          `Brevo request to ${path} failed with status ${response.status}`,
          { cause: { path, status: response.status, body: responseBody } }
        )
      )
    }
  }
