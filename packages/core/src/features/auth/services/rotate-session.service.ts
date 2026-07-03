import { TokenConsumedException } from '../exceptions/token-consumed.exception.ts'
import { TokenExpiredException } from '../exceptions/token-expired.exception.ts'
import { hashToken } from '../helpers/hash-token.ts'
import {
  deleteAndReturn,
  findByToken,
} from '../repositories/refresh-token.repository.ts'
import type { SessionTokens } from '../types/session.ts'
import { createSession } from './create-session.service.ts'

export async function rotateSession(
  refreshTokenValue: string,
  email?: string
): Promise<SessionTokens> {
  const hashed = hashToken(refreshTokenValue)

  const deleted = await deleteAndReturn(hashed)

  if (!deleted) {
    const existing = await findByToken(hashed)

    if (existing) {
      throw new TokenExpiredException({})
    }

    throw new TokenConsumedException({})
  }

  return createSession(deleted.userId, email)
}
