import { prisma } from '../../../prisma/client.ts'
import { hashToken } from '../helpers/hash-token.ts'
import { createSession } from './create-session.service.ts'
import { TokenExpiredException } from '../exceptions/token-expired.exception.ts'
import { TokenConsumedException } from '../exceptions/token-consumed.exception.ts'
import type { SessionTokens } from '../types/session.ts'

export async function rotateSession(
  refreshTokenValue: string,
  email?: string
): Promise<SessionTokens> {
  const hashed = hashToken(refreshTokenValue)

  const deleted = await prisma.$queryRaw<Array<{ id: string; userId: string }>>`
    DELETE FROM ngc."RefreshToken"
    WHERE token = ${hashed} AND "expiresAt" > NOW()
    RETURNING id, "userId"
  `

  if (deleted.length === 0) {
    const existing = await prisma.refreshToken.findFirst({
      where: { token: hashed },
      select: { id: true },
    })

    if (existing) {
      throw new TokenExpiredException({})
    }

    throw new TokenConsumedException({})
  }

  const { userId } = deleted[0]
  return createSession(userId, email)
}
