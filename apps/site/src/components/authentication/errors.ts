import type { EmailError } from '@/types/auth-errors'

export function mapEmailError(error: unknown): EmailError {
  if (error instanceof Error && error.message === 'Too Many Requests')
    return { _tag: 'rate_limited' }
  return { _tag: 'unknown' }
}
