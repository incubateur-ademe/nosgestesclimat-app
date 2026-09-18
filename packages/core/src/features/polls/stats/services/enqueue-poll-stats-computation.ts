import { invariant } from '../../../../lib/invariant.ts'
import type { Transaction } from '../../../../lib/transaction.ts'
import { prisma } from '../../../../prisma/client.ts'
import { findPollById } from '../../repositories/poll.repository.ts'
import {
  resolveCooldownSeconds,
  type CooldownTier,
} from '../helpers/cooldown-policy.ts'
import { pollStatsCooldownTiers } from '../helpers/poll-stats-cooldown-tiers.ts'
import {
  getPollStatsComputationStatus,
  schedulePollStatsComputation,
} from '../repositories/poll-stats-computations.repository.ts'

export type EnqueuePollStatsComputation = (
  pollId: string,
  tx?: Transaction
) => Promise<void>

export function createEnqueuePollStatsComputation({
  cooldownTiers,
}: {
  cooldownTiers: CooldownTier[]
}): EnqueuePollStatsComputation {
  return async function enqueuePollStatsComputation(
    pollId: string,
    tx: Transaction = prisma
  ): Promise<void> {
    const current = await getPollStatsComputationStatus(pollId, tx)

    // pending | processing → coalescing (no-op)
    if (current?.status === 'pending' || current?.status === 'processing') {
      return
    }

    let scheduledAt = new Date()
    if (current?.status === 'completed') {
      const poll = await findPollById(pollId, tx)
      invariant(poll) // a computation row implies its poll

      const cooldownSeconds = resolveCooldownSeconds(
        cooldownTiers,
        poll.participantsCount
      )
      scheduledAt = new Date(Date.now() + cooldownSeconds * 1000)
    }

    await schedulePollStatsComputation(pollId, scheduledAt, tx)
  }
}

export const enqueuePollStatsComputation = createEnqueuePollStatsComputation({
  cooldownTiers: pollStatsCooldownTiers,
})
