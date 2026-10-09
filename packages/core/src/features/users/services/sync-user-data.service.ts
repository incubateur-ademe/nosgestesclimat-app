import { transaction } from '../../../lib/transaction.ts'
import { transferOwnershipToUser } from '../repositories/ownership-transfer.repository.ts'

export const syncUserData = async ({
  user,
  verified,
}: {
  user: { id: string; email: string }
  verified?: boolean
}) => {
  await transaction((session) =>
    transferOwnershipToUser({ user, verified }, { session })
  )
}
