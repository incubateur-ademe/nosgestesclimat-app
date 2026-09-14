import { findLatestCompletedPollSimulation } from '../../simulations/repository/simulation.repository.ts'
import type { Simulation } from '../../simulations/types/simulation.ts'
import { MIN_PARTICIPANTS_FOR_RESULTS } from '../helpers/results-visibility.ts'
import { countPollParticipants } from '../repositories/poll-participation.repository.ts'
import {
  findPollByIdOrSlugInOrganisation,
  findPollResults,
} from '../repositories/poll.repository.ts'
import { resolveCooldownSeconds } from '../stats/helpers/cooldown-policy.ts'
import { pollStatsCooldownTiers } from '../stats/helpers/poll-stats-cooldown-tiers.ts'
import type { Poll, PollResults } from '../types/poll.ts'

export interface PollResult {
  poll: Poll
  /**
   * Delay the worker applies between two recomputations of this poll's
   * aggregates, in seconds. `results` can be that much older than
   * `participants`, which is counted live.
   */
  cooldownSeconds: number
  /** Finished simulations: an unfinished one is not a participant. */
  participants: number
  /**
   * `null` below `MIN_PARTICIPANTS_FOR_RESULTS`, and until the worker has
   * computed them.
   */
  results: PollResults | null
  /** `null` until the user has a finished simulation for this poll. */
  userParticipation: Simulation | null
}

/**
 * Everything the poll result page shows: the poll, how many people took part,
 * its aggregates when they may be published, and the viewer's own contribution
 * to compare against them.
 *
 * Returns `null` when the poll does not exist, or does not belong to the
 * organisation it is addressed through.
 */
export const getPollResult = async ({
  organisationSlug,
  pollIdOrSlug,
  userId,
}: {
  organisationSlug: string
  pollIdOrSlug: string
  userId: string | null
}): Promise<PollResult | null> => {
  const poll = await findPollByIdOrSlugInOrganisation({
    pollIdOrSlug,
    organisationSlug,
  })
  if (!poll) return null

  // The count needs the poll's id, the two other reads do not: reading all
  // three once the poll is known keeps this to two round trips.
  const [participants, userParticipation, results] = await Promise.all([
    countPollParticipants(poll.id),
    userId ? findLatestCompletedPollSimulation({ userId, pollIdOrSlug }) : null,
    findPollResults({ pollId: poll.id }),
  ])

  return {
    poll,
    cooldownSeconds: resolveCooldownSeconds(
      pollStatsCooldownTiers,
      participants
    ),
    participants,
    results: participants >= MIN_PARTICIPANTS_FOR_RESULTS ? results : null,
    userParticipation,
  }
}
