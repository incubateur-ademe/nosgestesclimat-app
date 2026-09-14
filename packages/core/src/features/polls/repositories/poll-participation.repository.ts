import type { Transaction } from '../../../lib/transaction.ts'
import { prisma } from '../../../prisma/client.ts'

/**
 * The simulations this user already entered in this poll. Empty means the user
 * has never participated, which is what decides whether joining is worth an
 * email.
 */
export const findUserPollParticipations = async ({
  pollId,
  userId,
}: {
  pollId: string
  userId: string
}): Promise<{ simulationId: string }[]> =>
  prisma.simulationPoll.findMany({
    where: { pollId, simulation: { userId } },
    select: { simulationId: true },
  })

export const createPollParticipation = async (
  {
    pollId,
    simulationId,
  }: {
    pollId: string
    simulationId: string
  },
  tx: Transaction = prisma
): Promise<void> => {
  await tx.simulationPoll.create({
    data: { pollId, simulationId },
    // `select` is narrowed to the id to reduce data transfer because Prisma
    // always returns a row: nothing here reads it.
    select: { id: true },
  })
}
