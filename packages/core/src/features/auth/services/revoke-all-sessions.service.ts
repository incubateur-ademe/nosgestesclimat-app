import type { Transaction } from '../../../lib/transaction.ts'
import { prisma } from '../../../prisma/client.ts'
import { deleteAllRefreshTokensForUserId } from '../repositories/refresh-token.repository.ts'

interface OptionalProps {
  session: Transaction
}

export async function revokeAllSessions(
  userId: string,
  optionalProps?: OptionalProps
): Promise<void> {
  const { session = prisma } = optionalProps ?? {}
  await deleteAllRefreshTokensForUserId(userId, { session })
}
