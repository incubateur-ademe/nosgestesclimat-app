import { transaction } from '../../../lib/transaction.ts'
import { revokeAllSessions } from '../../auth/services/revoke-all-sessions.service.ts'
import type { ResetUserProperties } from '../../emails/types.ts'
import {
  findUserById,
  softDeleteUser,
} from '../repositories/users.repository.ts'

type DeleteUserDependencies = {
  resetUserProperties: ResetUserProperties
}

/**
 * Erases a user and the Brevo contact attributes that carried their data.
 * The email is read before the soft delete removes the verified record; the
 * Brevo call runs after the transaction so the remote round-trip does not
 * hold the database transaction open.
 */
export const createDeleteUser =
  ({ resetUserProperties }: DeleteUserDependencies) =>
  async (userId: string) => {
    const user = await findUserById(userId)

    await transaction(async (session) => {
      await revokeAllSessions(userId, { session })
      await softDeleteUser(userId, { session })
    })

    if (user?.type === 'verified') {
      await resetUserProperties({ email: user.email })
    }
  }
