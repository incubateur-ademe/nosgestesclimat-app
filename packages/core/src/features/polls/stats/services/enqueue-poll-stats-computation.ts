import type { Transaction } from '../../../../lib/transaction.ts'
import { prisma } from '../../../../prisma/client.ts'
import { countPollParticipants } from '../../repositories/poll-participation.repository.ts'
import {
  parseCooldownTiers,
  resolveCooldownSeconds,
  type CooldownTier,
} from '../helpers/cooldown-policy.ts'
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
      const participants = await countPollParticipants(pollId, tx)
      const cooldownSeconds = resolveCooldownSeconds(
        cooldownTiers,
        participants
      )
      scheduledAt = new Date(Date.now() + cooldownSeconds * 1000)
    }

    await schedulePollStatsComputation(pollId, scheduledAt, tx)
  }
}

/**
 * The tiers are also advertised as the polls' refresh delay in the server
 * DTOs, so both must resolve them identically.
 */
export const enqueuePollStatsComputation = createEnqueuePollStatsComputation({
  cooldownTiers: parseCooldownTiers(process.env.POLL_STATS_COOLDOWN_TIERS),
})
