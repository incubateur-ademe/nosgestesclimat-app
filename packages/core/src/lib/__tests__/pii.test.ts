import { describe, expect, it } from 'vitest'
import { maskEmail } from '../pii.ts'

describe('maskEmail', () => {
  it('masks the local part and the domain', () => {
    expect(maskEmail('john@example.com')).toBe('jo***@ex***')
  })

  it('keeps the first two characters of each part, even when they overlap', () => {
    expect(maskEmail('jo@ex.com')).toBe('jo***@ex***')
  })

  it('is case-preserving to stay correlatable with a support report', () => {
    expect(maskEmail('John@Example.com')).toBe('Jo***@Ex***')
  })

  it('redacts non-string values', () => {
    expect(maskEmail(undefined)).toBe('[REDACTED]')
    expect(maskEmail(null)).toBe('[REDACTED]')
    expect(maskEmail(42)).toBe('[REDACTED]')
  })

  it('redacts strings without a domain', () => {
    expect(maskEmail('john')).toBe('[REDACTED]')
  })
})
