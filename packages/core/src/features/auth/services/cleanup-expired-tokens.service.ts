import { deleteAllExpired } from '../repositories/refresh-token.repository.ts'

const EXPIRED_RETENTION_DAYS = 7

export async function cleanupExpiredTokens(): Promise<void> {
  const before = new Date(
    Date.now() - EXPIRED_RETENTION_DAYS * 24 * 60 * 60 * 1000
  )
  await deleteAllExpired(before)
}
