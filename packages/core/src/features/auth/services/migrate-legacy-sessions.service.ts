import { getUser } from '../../users/services/get-user.service.ts'
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

  const user = await getUser({ userId })
  if (!user || user.type === 'verified') return null

  return await createSession(user.id)
}
