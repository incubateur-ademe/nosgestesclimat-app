import { failure, success, type Result } from '../../../lib/result.ts'
import { ModelFileFetchFailedError } from '../errors.ts'

const REQUEST_TIMEOUT_MS = 5_000
const MAX_ATTEMPTS = 2

/**
 * Retrieves one file of a model build that is not installed locally - a PR
 * preview or an older published version.
 *
 * Model files are large but immutable, so a single retry covers a transient
 * network hiccup while a 4xx (the build was never uploaded, or was pruned)
 * fails immediately.
 */
export async function fetchModelFile<T>(
  url: string
): Promise<Result<T, ModelFileFetchFailedError>> {
  let lastCause: unknown

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    let response: Response
    try {
      response = await fetch(url, {
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      })
    } catch (cause) {
      lastCause = cause
      continue
    }

    if (response.ok) {
      try {
        return success((await response.json()) as T)
      } catch (cause) {
        return failure(
          new ModelFileFetchFailedError({
            message: 'Model file is not valid JSON',
            url,
            cause,
          })
        )
      }
    }

    if (response.status < 500) {
      return failure(
        new ModelFileFetchFailedError({
          message: `Model file request failed with status ${response.status}`,
          url,
          status: response.status,
        })
      )
    }

    lastCause = new Error(
      `Model file request failed with status ${response.status}`
    )
  }

  return failure(
    new ModelFileFetchFailedError({
      message: `Model file request failed after ${MAX_ATTEMPTS} attempts`,
      url,
      cause: lastCause,
    })
  )
}
