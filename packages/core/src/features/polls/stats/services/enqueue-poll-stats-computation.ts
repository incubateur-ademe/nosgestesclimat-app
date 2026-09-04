import {
  resolveCooldownSeconds,
  type CooldownTier,
} from '../helpers/cooldown-policy.ts'
import {
  getPollStatsComputationStatus,
  schedulePollStatsComputation,
} from '../repositories/poll-stats-computations.repository.ts'
import { countPollSimulations } from '../repositories/poll-stats.repository.ts'

export function createEnqueuePollStatsComputation({
  cooldownTiers,
}: {
  cooldownTiers: CooldownTier[]
}) {
  return async function enqueuePollStatsComputation(
    pollId: string
  ): Promise<void> {
    const current = await getPollStatsComputationStatus(pollId)

    // pending | processing → coalescing (no-op)
    if (current?.status === 'pending' || current?.status === 'processing') {
      return
    }

    let scheduledAt = new Date()
    if (current?.status === 'completed') {
      const count = await countPollSimulations(pollId)
      const cooldownSeconds = resolveCooldownSeconds(cooldownTiers, count)
      scheduledAt = new Date(Date.now() + cooldownSeconds * 1000)
    }

    await schedulePollStatsComputation(pollId, scheduledAt)
  }
}
