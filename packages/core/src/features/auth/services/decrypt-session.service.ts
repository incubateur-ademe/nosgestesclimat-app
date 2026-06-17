import * as jose from 'jose'
import type { SessionPayload } from '../types/session.ts'
import { getSessionEncryptionKey } from '../helpers/get-session-encryption-key.ts'
import { SessionCryptoException } from '../exceptions/session-crypto.exception.ts'

const EXPIRATION_BYPASS_DATE = new Date(0)

export async function decryptSession(
  token: string
): Promise<SessionPayload> {
  const { payload } = await jose.jwtDecrypt(token, getSessionEncryptionKey(), {
    currentDate: EXPIRATION_BYPASS_DATE,
  }).catch(() => {
    throw new SessionCryptoException({ message: 'Invalid session token' })
  })

  return {
    userId: payload.userId as string,
    email: payload.email as string | undefined,
    iat: payload.iat as number,
    exp: payload.exp as number,
  }
}
