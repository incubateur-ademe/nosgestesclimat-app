import { transaction } from '../../../lib/transaction.ts'
import { revokeAllSessions } from '../../auth/services/revoke-all-sessions.service.ts'
import {
  deleteGroupParticipationsForUser,
  deleteGroupsAdministeredByUser,
} from '../../groups/repositories/group.repository.ts'
import { deleteOrganisationAdministrationsForUser } from '../../organisations/repositories/organisation.repository.ts'
import { deleteUser } from '../repositories/users.repository.ts'

export const eraseUser = async (userId: string) => {
  await transaction(async (session) => {
    // `OrganisationAdministrator.userEmail` restricts `VerifiedUser.email`:
    // the administrations go first or the verified record cannot be deleted.
    await deleteOrganisationAdministrationsForUser({ userId }, { session })
    // The groups the user runs go with the account; the ones they joined keep
    // their other members.
    await deleteGroupsAdministeredByUser({ userId }, { session })
    await deleteGroupParticipationsForUser({ userId }, { session })
    await revokeAllSessions(userId, { session })
    await deleteUser(userId, { session })
  })
}
