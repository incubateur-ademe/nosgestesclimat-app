import { transaction } from '../../../lib/transaction.ts'
import { transferSimulationsFromUser } from '../repositories/ownership-transfer.repository.ts'

export const reconcileSimulationsAfterLogin = async ({
  userId,
  previousUserId,
}: {
  userId: string
  previousUserId: string
}) => {
  await transaction((session) =>
    transferSimulationsFromUser({ userId, previousUserId }, { session })
  )
}
