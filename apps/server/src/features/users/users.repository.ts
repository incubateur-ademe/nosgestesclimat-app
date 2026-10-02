import {
  createOrUpdateUser,
  findUserById,
  findVerifiedUserByEmail,
} from '@nosgestesclimat/core/features/users/repositories/users.repository'
import { defaultUserSelection } from '../../adapters/prisma/selection.ts'
import type { Session } from '../../adapters/prisma/transaction.ts'
import type { PartialVerifiedUser } from '../../core/types/user.ts'

export { createOrUpdateUser, findUserById, findVerifiedUserByEmail }

export {
  transferOwnershipToUser,
  transferSimulationsFromUser,
} from '@nosgestesclimat/core/features/users/repositories/ownership-transfer.repository'

export const findUsersForEmail = (
  { email }: Pick<PartialVerifiedUser, 'email'>,
  { session }: { session: Session }
) => {
  return session.user.findMany({
    where: {
      email,
    },
    select: defaultUserSelection,
  })
}
