import * as jose from 'jose'
import type { SessionPayload } from '../types/session.ts'
import { getSessionEncryptionKey } from './get-session-encryption-key.ts'

export async function encryptSession(
  payload: SessionPayload,
  ttlSeconds: number
): Promise<string> {
  return new jose.EncryptJWT({ ...payload })
    .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
    .setIssuedAt()
    .setExpirationTime(`${ttlSeconds}s`)
    .encrypt(getSessionEncryptionKey())
}
