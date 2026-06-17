import { randomBytes } from 'node:crypto'
import { prisma } from '../../../prisma/client.ts'
import { hashToken } from '../helpers/hash-token.ts'
import { encryptSession } from '../helpers/encrypt-session'
import type { SessionPayload, SessionTokens } from '../types/session.ts'

const SESSION_TTL = 15 * 60
const REFRESH_TTL_DAYS = 180

export async function rotateSession(
  refreshTokenValue: string,
  email?: string
): Promise<SessionTokens | null> {
  const hashed = hashToken(refreshTokenValue)
  const expiresAt = new Date(
    Date.now() + REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000
  )
  const newRefreshToken = randomBytes(32).toString('base64url')

  const deleted = await prisma.$queryRaw<Array<{ id: string; userId: string }>>`
    DELETE FROM ngc."RefreshToken"
    WHERE token = ${hashed} AND "expiresAt" > NOW()
    RETURNING id, "userId"
  `

  if (deleted.length === 0) return null

  const { userId } = deleted[0]

  await prisma.refreshToken.create({
    data: {
      userId,
      token: hashToken(newRefreshToken),
      expiresAt,
    },
  })

  const accessToken = await encryptSession(
    { userId, email, iat: 0, exp: 0 } as SessionPayload,
    SESSION_TTL
  )

  return { accessToken, refreshToken: newRefreshToken }
}
