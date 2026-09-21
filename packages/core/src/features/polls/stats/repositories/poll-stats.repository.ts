import type { FunFacts } from '@incubateur-ademe/nosgestesclimat'
import { prisma } from '../../../../prisma/client.ts'
import type { ComputedResults } from '../../../simulations/validators/computed-results.schema.ts'
import type { PollStats } from '../types/poll-stats.ts'
import { toPollStats } from './poll-stats.mapper.ts'

const pollStatsSelect = {
  computedResults: true,
  funFacts: true,
} as const

/**
 * The aggregates the worker computed, read apart from the poll itself: they
 * only leave the database through a read that asks for them.
 */
export const findPollStats = async ({
  pollId,
}: {
  pollId: string
}): Promise<PollStats | null> => {
  const row = await prisma.poll.findUnique({
    where: { id: pollId },
    select: pollStatsSelect,
  })

  return row ? toPollStats(row) : null
}

/**
 * Single writer for the poll aggregates: the participant count cannot disagree
 * with the stats it is written with.
 */
export const updatePollStats = (
  pollId: string,
  {
    computedResults,
    funFacts,
    participantsCount,
  }: {
    computedResults: ComputedResults
    funFacts: FunFacts
    participantsCount: number
  }
) =>
  prisma.poll.update({
    where: { id: pollId },
    data: { computedResults, funFacts, participantsCount },
  })
