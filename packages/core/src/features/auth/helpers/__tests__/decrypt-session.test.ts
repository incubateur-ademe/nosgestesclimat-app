import { describe, expect, it } from 'vitest'
import { encryptSession } from '../../helpers/encrypt-session'
import { decryptSession } from '../../services/decrypt-session.service'
import { SessionCryptoException } from '../../exceptions/session-crypto.exception.ts'
import type { SessionPayload } from '../../types/session.ts'

describe('encryptSession', () => {
  it('produces different tokens for same payload (nonce/IV)', async () => {
    const payload: SessionPayload = { userId: 'abc', iat: 0, exp: 0 }
    const t1 = await encryptSession(payload, 60)
    const t2 = await encryptSession(payload, 60)
    expect(t1).not.toBe(t2)
  })
})

describe('decryptSession', () => {
  it('round-trips: encrypt then decrypt returns original payload', async () => {
    const payload: SessionPayload = {
      userId: 'abc',
      email: 'test@example.com',
      iat: 0,
      exp: 0,
    }
    const token = await encryptSession(payload, 60)
    const decrypted = await decryptSession(token)
    expect(decrypted.userId).toBe('abc')
    expect(decrypted.email).toBe('test@example.com')
  })

  it('throws SessionCryptoException for a corrupted token', async () => {
    await expect(decryptSession('not-a-valid-token')).rejects.toThrow(
      SessionCryptoException
    )
  })

  it('throws SessionCryptoException for an empty string', async () => {
    await expect(decryptSession('')).rejects.toThrow(SessionCryptoException)
  })

  it('returns payload even when token is expired', async () => {
    const payload: SessionPayload = {
      userId: 'user-1',
      iat: 0,
      exp: 0,
    }
    const token = await encryptSession(payload, -1)
    const result = await decryptSession(token)
    expect(result.userId).toBe('user-1')
  })
})
