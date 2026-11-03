import { transaction } from '../../../lib/transaction.ts'
import { revokeAllSessions } from '../../auth/services/revoke-all-sessions.service.ts'
import { deleteOrganisationAdministrationsForUser } from '../../organisations/repositories/organisation.repository.ts'
import { softDeleteUser } from '../repositories/users.repository.ts'

export const deleteUser = async (userId: string) => {
  await transaction(async (session) => {
    await deleteOrganisationAdministrationsForUser({ userId }, { session })
    await revokeAllSessions(userId, { session })
    await softDeleteUser(userId, { session })
  })
}
