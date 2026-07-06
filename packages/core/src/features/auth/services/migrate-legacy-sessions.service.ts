import jwt from 'jsonwebtoken'
import { getFullUser } from '../../users/services/get-full-user.service.ts'
import type { SessionTokens } from '../types/session.ts'
import { createSession } from './create-session.service.ts'

export async function migrateLegacySessions(input: {
  jwt?: string
  ironUserId?: string
}): Promise<SessionTokens | null> {
  return (
    (await migrateJwt(input.jwt)) ?? (await migrateIronUser(input.ironUserId))
  )
}

async function migrateJwt(token?: string): Promise<SessionTokens | null> {
  if (!token) return null

  const secret = process.env.LEGACY_JWT_SECRET
  if (!secret) throw new Error('LEGACY_JWT_SECRET is not defined')

  try {
    const payload = jwt.verify(token, secret) as {
      userId: string
      email?: string
    }

    return await createSession(payload.userId, payload.email)
  } catch {
    return null
  }
}

async function migrateIronUser(userId?: string): Promise<SessionTokens | null> {
  if (!userId) return null

  const user = await getFullUser({ userId })
  if (!user) return null

  return await createSession(user.id)
}
