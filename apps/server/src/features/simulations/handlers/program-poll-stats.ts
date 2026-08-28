import { enqueuePollStatsComputation } from '@nosgestesclimat/core/features/polls/stats/repositories/poll-stats-computations.repository'
import type { Handler } from '../../../core/event-bus/handler.ts'
import logger from '../../../logger.ts'
import type { SimulationUpsertedEvent } from '../events/SimulationUpserted.event.ts'

export const programPollStats: Handler<SimulationUpsertedEvent> = async ({
  attributes: { simulation, poll },
}) => {
  if (simulation.progression !== 1 || !poll) return

  try {
    await enqueuePollStatsComputation(poll.id)
  } catch (error) {
    logger.error('Poll stats enqueue failed', { pollId: poll.id, error })
  }
}
