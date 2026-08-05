import { describe, expect, it } from 'vitest'
import { maskEmail, truncateUserId } from './maskEmail'

describe('maskEmail', () => {
  it('keeps enough of the address to correlate without storing it', () => {
    expect(maskEmail('john.doe@example.com')).toBe('jo***@ex***')
  })

  it('returns a placeholder for non-string values', () => {
    expect(maskEmail(undefined)).toBe('[REDACTED]')
    expect(maskEmail('')).toBe('[REDACTED]')
  })
})

describe('truncateUserId', () => {
  it('keeps only the first 8 characters of a session id', () => {
    expect(truncateUserId('01234567-89ab-cdef-0123-456789abcdef')).toBe(
      '01234567***'
    )
  })

  it('returns a placeholder for non-string values', () => {
    expect(truncateUserId(undefined)).toBe('[REDACTED]')
  })
})
