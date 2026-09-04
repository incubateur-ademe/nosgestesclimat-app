import type { FunFacts } from '@incubateur-ademe/nosgestesclimat'
import { failure, success, type Result } from '../../../../lib/result.ts'
import type { ComputedResultSchema } from '../../../simulations/validators/computed-results.schema.ts'
import { PollStatsComputationFailedError } from '../exceptions/poll-stats-computation.exception.ts'
import {
  claimNextPendingPollStatsComputation,
  markPollStatsComputationCompleted,
  markPollStatsComputationFailed,
} from '../repositories/poll-stats-computations.repository.ts'
import { updatePollStats } from '../repositories/poll-stats.repository.ts'

type ComputePollStats = (pollId: string) => Promise<{
  computedResults: ComputedResultSchema
  funFacts: FunFacts
}>

/**
 * Entry point called by the worker in a loop.
 *
 * Claims the next eligible PollStatsComputation job and recomputes the poll's
 * stats. Returns `success(true)` when a recompute was completed, `success(false)`
 * when the queue was empty, and a failure otherwise.
 */
export function createProcessNextPendingPollStats({
  computePollStats,
}: {
  computePollStats: ComputePollStats
}) {
  return async function processNextPendingPollStats(): Promise<
    Result<boolean, PollStatsComputationFailedError>
  > {
    const claimed = await claimNextPendingPollStatsComputation()
    if (!claimed) {
      return success(false)
    }

    const { pollId } = claimed

    try {
      const { computedResults, funFacts } = await computePollStats(pollId)

      await updatePollStats(pollId, { computedResults, funFacts })

      await markPollStatsComputationCompleted(pollId)
      return success(true)
    } catch (error) {
      try {
        await markPollStatsComputationFailed(pollId)
      } catch (cleanupError) {
        return failure(
          new PollStatsComputationFailedError({
            pollId,
            cause: new SuppressedError(cleanupError, error),
          })
        )
      }
      return failure(
        new PollStatsComputationFailedError({ pollId, cause: error })
      )
    }
  }
}
