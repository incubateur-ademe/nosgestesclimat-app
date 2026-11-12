import { transaction } from '../../../lib/transaction.ts'
import { deleteVerificationCodesForEmail } from '../../auth/repositories/verification-codes.repository.ts'
import { revokeAllSessions } from '../../auth/services/revoke-all-sessions.service.ts'
import type { EraseContact } from '../../emails/types.ts'
import {
  deleteGroupParticipationsForUser,
  deleteGroupsAdministeredByUser,
} from '../../groups/repositories/group.repository.ts'
import { deleteOrganisationAdministrationsForUser } from '../../organisations/repositories/organisation.repository.ts'
import {
  deleteUser,
  findVerifiedEmail,
} from '../repositories/users.repository.ts'

interface EraseUserDependencies {
  /** Wipes the account data the emailing contact carries; the contact itself
   * survives, for its newsletter subscription. */
  eraseContact: EraseContact
}

export const eraseUser = async (
  userId: string,
  { eraseContact }: EraseUserDependencies
) => {
  // Read before the erasure: the record holding it goes with the account.
  const email = await findVerifiedEmail(userId)

  await transaction(async (session) => {
    // `OrganisationAdministrator.userEmail` restricts `VerifiedUser.email`:
    // the administrations go first or the verified record cannot be deleted.
    await deleteOrganisationAdministrationsForUser({ userId }, { session })
    // The groups the user runs go with the account; the ones they joined keep
    // their other members.
    await deleteGroupsAdministeredByUser({ userId }, { session })
    await deleteGroupParticipationsForUser({ userId }, { session })
    // Before the contact: a session still alive could rewrite the account
    // identifier on it.
    await revokeAllSessions(userId, { session })
    if (email) {
      await deleteVerificationCodesForEmail({ email }, { session })
    }
    await deleteUser(userId, { session })
  })

  if (!email) {
    return
  }

  // Outside the transaction: an HTTP call must not hold it open.
  const result = await eraseContact({ email })
  if (!result.success) {
    throw result.error
  }
}
