import { describe, expect, it } from 'vitest'
import { isSessionExpired } from '../is-session-expired.ts'
import type { SessionPayload } from '../../types/session.ts'

describe('isSessionExpired', () => {
  it('returns false when exp is in the future', () => {
    const payload: SessionPayload = {
      userId: 'abc',
      iat: 0,
      exp: Math.floor(Date.now() / 1000) + 60,
    }
    expect(isSessionExpired(payload)).toBe(false)
  })

  it('returns true when exp is in the past', () => {
    const payload: SessionPayload = {
      userId: 'abc',
      iat: 0,
      exp: Math.floor(Date.now() / 1000) - 60,
    }
    expect(isSessionExpired(payload)).toBe(true)
  })
})
