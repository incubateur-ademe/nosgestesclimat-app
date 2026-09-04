import { prisma } from '../../../prisma/client.ts'
import { PollFactory, pollGenerator } from './poll.factory.ts'

/**
 * Factory for a Poll with an attached `PollStatsComputation` row, mirroring
 * `SimulationComputationFactory`: the poll is created through the shared
 * `pollGenerator` (which creates the required organisation unless an
 * `organisationId` is passed) and each builder inserts the corresponding
 * computation row.
 */
export class PollStatsComputationFactory extends PollFactory {
  withPendingComputation(scheduledAt: Date): this {
    return this.afterCreate(async (poll) => {
      await prisma.pollStatsComputation.create({
        data: { pollId: poll.id, status: 'pending', scheduledAt },
      })
      return poll
    })
  }

  withCompletedComputation(): this {
    return this.afterCreate(async (poll) => {
      await prisma.pollStatsComputation.create({
        data: { pollId: poll.id, status: 'completed', scheduledAt: null },
      })
      return poll
    })
  }

  withFailedComputation(): this {
    return this.afterCreate(async (poll) => {
      await prisma.pollStatsComputation.create({
        data: { pollId: poll.id, status: 'failed', scheduledAt: null },
      })
      return poll
    })
  }

  withProcessingComputation(startedAt: Date = new Date()): this {
    return this.afterCreate(async (poll) => {
      await prisma.pollStatsComputation.create({
        data: { pollId: poll.id, status: 'processing', startedAt },
      })
      return poll
    })
  }

  withStaleProcessingComputation(): this {
    return this.withProcessingComputation(new Date(Date.now() - 60 * 60 * 1000))
  }
}

export const pollStatsComputationFactory =
  PollStatsComputationFactory.define(pollGenerator)
