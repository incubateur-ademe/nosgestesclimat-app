import type { FunFacts } from '@incubateur-ademe/nosgestesclimat'
import type { ComputedResults } from '../../../simulations/validators/computed-results.schema.ts'
import { PollStatsComputationFailedException } from '../exceptions/poll-stats-computation.exception.ts'
import { resolvePollStatsCooldownSeconds } from '../helpers/policy.ts'
import {
  claimNextPendingPollStatsComputation,
  markPollStatsComputationCompleted,
  markPollStatsComputationFailed,
  releasePollStatsComputation,
} from '../repositories/poll-stats-computations.repository.ts'
import {
  countPollSimulations,
  updatePollStats,
} from '../repositories/poll-stats.repository.ts'

type ComputePollStats = (pollId: string) => Promise<{
  computedResults: ComputedResults
  funFacts: FunFacts
}>

/**
 * Entry point called by the worker in a loop.
 *
 * Claims the next eligible PollStatsComputation job, computes the poll's
 * participation count to resolve its cooldown, defers the job (via `runAt`)
 * when the cooldown has not elapsed yet, otherwise recomputes the poll stats
 * and stores them on the poll. Returns `true` when a recompute was completed,
 * `false` when the queue was empty or the job was deferred.
 */
export function createProcessNextPendingPollStats({
  computePollStats,
}: {
  computePollStats: ComputePollStats
}) {
  return async function processNextPendingPollStats(): Promise<boolean> {
    const claimed = await claimNextPendingPollStatsComputation()
    if (!claimed) {
      return false
    }

    const { pollId, completedAt } = claimed

    try {
      const count = await countPollSimulations(pollId)
      const cooldownSeconds = resolvePollStatsCooldownSeconds(count)

      if (completedAt) {
        const nextRunAt = completedAt.getTime() + cooldownSeconds * 1000
        if (nextRunAt > Date.now()) {
          await releasePollStatsComputation(pollId, new Date(nextRunAt))
          return false
        }
      }

      const { computedResults, funFacts } = await computePollStats(pollId)

      await updatePollStats(pollId, { computedResults, funFacts })

      await markPollStatsComputationCompleted(pollId)
      return true
    } catch (error) {
      try {
        await markPollStatsComputationFailed(pollId)
      } catch (cleanupError) {
        throw new PollStatsComputationFailedException({
          pollId,
          cause: new SuppressedError(cleanupError, error),
        })
      }
      throw new PollStatsComputationFailedException({
        pollId,
        cause: error,
      })
    }
  }
}
