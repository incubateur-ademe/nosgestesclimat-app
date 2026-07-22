// TODO: replace error.message string matching with typed error results
// from server actions once proper error handling is in place (Either monad,
// discriminated union return types, etc.). instanceof doesn't survive
// Next.js server action serialization to the client.
import type { CodeError, EmailError } from './types'

function getErrorMessage(error: unknown): string | undefined {
  if (error instanceof Error) return error.message
  return (error as Record<string, unknown>)?.message as string | undefined
}

export function mapLoginError(error: unknown): CodeError {
  const msg = getErrorMessage(error)
  if (msg === 'Unauthorized') return 'invalid'
  if (msg === 'Too Many Requests') return 'rate_limited'
  return 'unknown'
}

export function mapEmailError(error: unknown): EmailError {
  if (getErrorMessage(error) === 'Too Many Requests') return 'rate_limited'
  return 'unknown'
}
