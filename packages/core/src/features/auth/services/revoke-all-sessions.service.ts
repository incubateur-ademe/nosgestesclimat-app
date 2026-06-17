import { deleteAllForUserId } from '../repositories/refresh-token.repository.ts'

export async function revokeAllSessions(userId: string): Promise<void> {
  await deleteAllForUserId(userId)
}
