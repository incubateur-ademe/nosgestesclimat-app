import { createEnqueuePollStatsComputation } from '@nosgestesclimat/core/features/polls/stats/services/enqueue-poll-stats-computation'
import { config } from '../../../config.ts'
import type { Handler } from '../../../core/event-bus/handler.ts'
import logger from '../../../logger.ts'
import type { SimulationUpsertedEvent } from '../events/SimulationUpserted.event.ts'

const enqueuePollStatsComputation = createEnqueuePollStatsComputation({
  cooldownTiers: config.app.pollStatsCooldownTiers,
})

export const programPollStatsComputation: Handler<
  SimulationUpsertedEvent
> = async ({ attributes: { simulation, poll } }) => {
  if (simulation.progression !== 1 || !poll) return

  try {
    await enqueuePollStatsComputation(poll.id)
  } catch (error) {
    logger.error('Poll stats enqueue failed', { pollId: poll.id, error })
  }
}
