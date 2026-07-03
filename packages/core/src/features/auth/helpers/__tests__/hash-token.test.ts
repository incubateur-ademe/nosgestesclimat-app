import { describe, expect, it } from 'vitest'
import { hashToken } from '../hash-token.ts'

describe('hashToken', () => {
  it('returns a deterministic hash', () => {
    const result = hashToken('hello')
    expect(result).toBe(hashToken('hello'))
  })

  it('produces different hashes for different inputs', () => {
    expect(hashToken('a')).not.toBe(hashToken('b'))
  })

  it('returns a 64-char hex string (SHA-256)', () => {
    const result = hashToken('test')
    expect(result).toHaveLength(64)
    expect(result).toMatch(/^[a-f0-9]{64}$/)
  })
})
