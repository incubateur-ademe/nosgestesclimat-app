import { describe, expect, it } from 'vitest'
import { encryptSession } from '../../helpers/encrypt-session.ts'
import type { SessionPayload } from '../../types/session.ts'

describe('encryptSession', () => {
  it('produces different tokens for same payload (nonce/IV)', async () => {
    const payload: SessionPayload = { userId: 'abc', iat: 0, exp: 0 }
    const t1 = await encryptSession(payload, 60)
    const t2 = await encryptSession(payload, 60)
    expect(t1).not.toBe(t2)
  })
})
