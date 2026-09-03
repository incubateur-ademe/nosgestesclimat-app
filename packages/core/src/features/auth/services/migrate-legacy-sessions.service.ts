import { getFullUser } from '../../users/services/get-full-user.service.ts'
import type { SessionTokens } from '../types/session.ts'
import { createSession } from './create-session.service.ts'

export async function migrateLegacySessions({
  ironUserId,
}: {
  ironUserId?: string
}): Promise<SessionTokens | null> {
  return migrateIronUser(ironUserId)
}

async function migrateIronUser(userId?: string): Promise<SessionTokens | null> {
  if (!userId) return null

  const user = await getFullUser({ userId })
  if (!user || user.isVerified) return null

  return await createSession(user.id)
}
