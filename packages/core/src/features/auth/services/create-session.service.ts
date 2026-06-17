import { randomBytes } from 'node:crypto'
import { hashToken } from '../helpers/hash-token.ts'
import { encryptSession } from '../helpers/encrypt-session.ts'
import { createRefreshToken } from '../repositories/refresh-token.repository.ts'
import type { SessionTokens } from '../types/session.ts'

const SESSION_TTL = 15 * 60
const REFRESH_TTL_DAYS = 180

export async function createSession(
  userId: string,
  email?: string
): Promise<SessionTokens> {
  const refreshToken = randomBytes(32).toString('base64url')
  const accessToken = await encryptSession(
    { userId, email, iat: 0, exp: 0 },
    SESSION_TTL
  )

  const expiresAt = new Date(
    Date.now() + REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000
  )

  await createRefreshToken({
    userId,
    token: hashToken(refreshToken),
    expiresAt,
  })

  return { accessToken, refreshToken }
}
