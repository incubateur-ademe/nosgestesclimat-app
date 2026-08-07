import { describe, expect, it } from 'vitest'
import { maskEmail, maskUserId } from '../pii.ts'

describe('maskEmail', () => {
  it('keeps enough of the address to correlate without storing it', () => {
    expect(maskEmail('john.doe@example.com')).toBe('jo***@ex***')
  })

  it('returns a placeholder for non-string values', () => {
    expect(maskEmail(undefined)).toBe('[REDACTED]')
    expect(maskEmail('')).toBe('[REDACTED]')
  })
})

describe('maskUserId', () => {
  it('keeps only the first 8 characters of a session id', () => {
    expect(maskUserId('01234567-89ab-cdef-0123-456789abcdef')).toBe(
      '01234567***'
    )
  })

  it('returns a placeholder for non-string values', () => {
    expect(maskUserId(undefined)).toBe('[REDACTED]')
  })
})
