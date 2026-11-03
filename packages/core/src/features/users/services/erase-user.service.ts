import { transaction } from '../../../lib/transaction.ts'
import { revokeAllSessions } from '../../auth/services/revoke-all-sessions.service.ts'
import { deleteOrganisationAdministrationsForUser } from '../../organisations/repositories/organisation.repository.ts'
import { deleteUser } from '../repositories/users.repository.ts'

export const eraseUser = async (userId: string) => {
  await transaction(async (session) => {
    // `OrganisationAdministrator.userEmail` restricts `VerifiedUser.email`:
    // the administrations go first or the verified record cannot be deleted.
    await deleteOrganisationAdministrationsForUser({ userId }, { session })
    await revokeAllSessions(userId, { session })
    await deleteUser(userId, { session })
  })
}
