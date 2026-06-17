import { deleteAllExpired } from '../repositories/refresh-token.repository.ts'

export async function cleanupExpiredTokens(): Promise<void> {
  await deleteAllExpired()
}
