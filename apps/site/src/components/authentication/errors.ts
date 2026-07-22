// TODO: replace error.message string matching with typed error results
// from server actions once proper error handling is in place (Either monad,
// discriminated union return types, etc.). instanceof doesn't survive
// Next.js server action serialization to the client.
import type { CodeError, EmailError } from './types'

export function mapLoginError(error: unknown): CodeError {
  if (error instanceof Error) {
    if (error.message === 'Unauthorized') return 'invalid'
    if (error.message === 'Too Many Requests') return 'rate_limited'
  }
  return 'unknown'
}

export function mapEmailError(error: unknown): EmailError {
  if (error instanceof Error && error.message === 'Too Many Requests') {
    return 'rate_limited'
  }
  return 'unknown'
}
