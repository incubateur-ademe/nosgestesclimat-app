import { transaction } from '../../../lib/transaction.ts'
import { transferSimulationsFromUser } from '../repositories/ownership-transfer.repository.ts'

export const reconcileSimulationsAfterLogin = async ({
  user,
  previousUserId,
}: {
  user: { id: string; email: string }
  previousUserId: string
}) => {
  await transaction((session) =>
    transferSimulationsFromUser({ user, previousUserId }, { session })
  )
}
