import { success, type Result } from '../../../../lib/result.ts'
import type { Transaction } from '../../../../lib/transaction.ts'
import { prisma } from '../../../../prisma/client.ts'
import {
  parseCooldownTiers,
  resolveCooldownSeconds,
  type CooldownTier,
} from '../helpers/cooldown-policy.ts'
import {
  getPollStatsComputationStatus,
  schedulePollStatsComputation,
} from '../repositories/poll-stats-computations.repository.ts'
import { countPollSimulations } from '../repositories/poll-stats.repository.ts'

export type EnqueuePollStatsComputation = (
  pollId: string,
  tx?: Transaction
) => Promise<Result<void, never>>

export function createEnqueuePollStatsComputation({
  cooldownTiers,
}: {
  cooldownTiers: CooldownTier[]
}): EnqueuePollStatsComputation {
  return async function enqueuePollStatsComputation(
    pollId: string,
    tx: Transaction = prisma
  ): Promise<Result<void, never>> {
    const current = await getPollStatsComputationStatus(pollId, tx)

    // pending | processing → coalescing (no-op)
    if (current?.status === 'pending' || current?.status === 'processing') {
      return success()
    }

    let scheduledAt = new Date()
    if (current?.status === 'completed') {
      const count = await countPollSimulations(pollId, tx)
      const cooldownSeconds = resolveCooldownSeconds(cooldownTiers, count)
      scheduledAt = new Date(Date.now() + cooldownSeconds * 1000)
    }

    await schedulePollStatsComputation(pollId, scheduledAt, tx)
    return success()
  }
}

/**
 * The server reads the same variable to advertise the refresh delay in the
 * public poll DTO, so both must resolve the tiers identically.
 */
export const enqueuePollStatsComputation = createEnqueuePollStatsComputation({
  cooldownTiers: parseCooldownTiers(process.env.POLL_STATS_COOLDOWN_TIERS),
})
