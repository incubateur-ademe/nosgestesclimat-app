import { randomBytes } from 'node:crypto'
import { recordUserActivity } from '../../users/repositories/users.repository.ts'
import {
  REFRESH_TOKEN_TTL_DAYS,
  SESSION_TTL_SECONDS,
} from '../constants/session.ts'
import { encryptSession } from '../helpers/encrypt-session.ts'
import { hashToken } from '../helpers/hash-token.ts'
import { createRefreshToken } from '../repositories/refresh-token.repository.ts'
import type { SessionTokens } from '../types/session.ts'

export async function createSession(
  userId: string,
  email?: string
): Promise<SessionTokens> {
  const refreshToken = randomBytes(32).toString('base64url')
  const accessToken = await encryptSession(
    { userId, email },
    SESSION_TTL_SECONDS
  )

  const expiresAt = new Date(
    Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000
  )

  // Stamped before the token: a missing activity date lets the sweep mistake
  // an active account for an idle one, and that mistake cannot be undone.
  await recordUserActivity({ userId })

  await createRefreshToken({
    userId,
    token: hashToken(refreshToken),
    expiresAt,
  })

  return { accessToken, refreshToken }
}
