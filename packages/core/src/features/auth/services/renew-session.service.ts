import { recordUserActivity } from '../../users/repositories/users.repository.ts'
import {
  SESSION_ROTATION_TOLERANCE_SECONDS,
  SESSION_TTL_SECONDS,
} from '../constants/session.ts'
import { encryptSession } from '../helpers/encrypt-session.ts'
import { generateRefreshToken } from '../helpers/generate-refresh-token.ts'
import { hashToken } from '../helpers/hash-token.ts'
import {
  findByPreviousToken,
  rotateToken,
} from '../repositories/refresh-token.repository.ts'
import { revokeAllSessions } from './revoke-all-sessions.service.ts'

/** The pair a renewal hands back. */
export interface RenewedTokens {
  accessToken: string
  /**
   * Only when this call rotated: a concurrent request holds a key that is no
   * longer current, so writing it would overwrite the one just installed.
   */
  refreshToken?: string
}

export type RenewalOutcome =
  | { status: 'rotated'; tokens: RenewedTokens }
  /** A concurrent request rotated moments ago; this one is not an attack. */
  | { status: 'concurrent'; tokens: RenewedTokens; ageMs: number }
  /** Presented after the tolerance window: treated as a replay, family revoked. */
  | { status: 'replayed'; ageMs: number }
  /** No live session carries this key: expired, revoked or never issued. */
  | { status: 'unrecognised' }

/**
 * Renews an expired access token from the session's refresh key, rotating it in
 * place and tolerating a concurrent request for the tolerance window. Throws
 * only when the outcome could not be decided.
 */
export async function renewSession({
  refreshToken,
  email,
}: {
  refreshToken: string
  email?: string
}): Promise<RenewalOutcome> {
  const hashedToken = hashToken(refreshToken)
  const nextToken = generateRefreshToken()

  const rotation = await rotateToken({
    hashedToken,
    newHashedToken: hashToken(nextToken),
  })

  const issueAccessToken = (userId: string) =>
    encryptSession({ userId, email }, SESSION_TTL_SECONDS)

  if (rotation.success) {
    const { userId } = rotation.data
    await recordUserActivity({ userId })

    return {
      status: 'rotated',
      tokens: {
        accessToken: await issueAccessToken(userId),
        refreshToken: nextToken,
      },
    }
  }

  // The key is not the live one. Either a request from the same page replaced it
  // moments ago, or it comes back after the tolerance window: `rotatedAt` is
  // what separates the two.
  const replaced = await findByPreviousToken(hashedToken)
  if (!replaced?.rotatedAt) return { status: 'unrecognised' }

  const ageMs = Date.now() - replaced.rotatedAt.getTime()

  if (ageMs > SESSION_ROTATION_TOLERANCE_SECONDS * 1000) {
    // The whole family goes, so a replay costs the attacker the session too.
    await revokeAllSessions(replaced.userId)
    return { status: 'replayed', ageMs }
  }

  await recordUserActivity({ userId: replaced.userId })

  return {
    status: 'concurrent',
    ageMs,
    tokens: { accessToken: await issueAccessToken(replaced.userId) },
  }
}
