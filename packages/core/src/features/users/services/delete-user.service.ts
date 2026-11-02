import { transaction } from '../../../lib/transaction.ts'
import { revokeAllSessions } from '../../auth/services/revoke-all-sessions.service.ts'
import type { Logger } from '../../logger/index.ts'
import { softDeleteUser } from '../repositories/users.repository.ts'

export function createDeleteUser({ logger }: { logger: Logger }) {
  return async (userId: string) => {
    await transaction(async (session) => {
      logger.info('Deleting user account', { userId })
      await revokeAllSessions(userId, { session })
      await softDeleteUser(userId, { session })
      logger.info('User account deleted', { userId })
    })
  }
}
