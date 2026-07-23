// TODO: replace error.message string matching with typed error results
// from server actions once proper error handling is in place (Either monad,
// discriminated union return types, etc.). instanceof doesn't survive
// Next.js server action serialization to the client.
import type { EmailError } from '@/types/auth-errors'

function getErrorMessage(error: unknown): string | undefined {
  if (error instanceof Error) return error.message
  return (error as Record<string, unknown>)?.message as string | undefined
}

export function mapEmailError(error: unknown): EmailError {
  if (getErrorMessage(error) === 'Too Many Requests')
    return { _tag: 'rate_limited' }
  return { _tag: 'unknown' }
}
