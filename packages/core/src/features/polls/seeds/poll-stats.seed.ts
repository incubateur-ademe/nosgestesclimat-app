import type { Logger } from '../../logger/index.ts'
import { createComputePollStats } from '../stats/legacy/compute-poll-stats.ts'
import { updatePollStats } from '../stats/repositories/poll-stats.repository.ts'

/**
 * A logger that stays silent. Computing statistics is a step of the seed, not
 * something the caller asked to hear about; a failure is reported by throwing.
 */
const silentLogger: Logger = {
  error: () => {},
  warn: () => {},
  info: () => {},
  debug: () => {},
}

const computePollStats = createComputePollStats({ logger: silentLogger })

/**
 * Computes and stores the statistics of every given poll: the aggregated
 * footprint of its participants, the fun facts that go with it, and their
 * count.
 */
export const seedPollStats = async (
  pollIds: string[]
): Promise<{ pollId: string; participantsCount: number }[]> => {
  const results = []

  for (const pollId of pollIds) {
    const stats = await computePollStats(pollId)

    await updatePollStats(pollId, stats)

    results.push({ pollId, participantsCount: stats.participantsCount })
  }

  return results
}
