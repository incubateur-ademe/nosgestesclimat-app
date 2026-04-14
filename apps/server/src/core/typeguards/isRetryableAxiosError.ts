import type { AxiosError } from 'axios'
import {
  isIdempotentRequestError,
  isNetworkError,
  isRetryableError,
} from 'axios-retry'

/*
 * wrapper function that evaluates:
 * - is Timeout error
 */
export const isTimeoutError = (error: AxiosError): boolean =>
  Boolean(error?.code) && error?.code === 'ECONNABORTED'

/*
 * wrapper function that evaluates:
 * - isNetworkError
 * - is Timeout error
 */
export const isNetworkOrTimeoutError = (error: AxiosError): boolean =>
  isNetworkError(error) || isTimeoutError(error)

/*
 * wrapper function that evaluates:
 * - isNetworkError
 * - is Timeout error
 * - isIdempotentRequestError (POST requests are not considered as idempotent by axios-retry)
 */
export const isNetworkOrTimeoutOrIdempotentError = (
  error: AxiosError
): boolean => isNetworkOrTimeoutError(error) || isIdempotentRequestError(error)

/*
 * wrapper function that evaluates:
 * - isNetworkError
 * - is Timeout error
 * - isRetryableRequestError (POST requests are retryable)
 */
export const isNetworkOrTimeoutOrRetryableError = (
  error: AxiosError
): boolean => isNetworkOrTimeoutError(error) || isRetryableError(error)
