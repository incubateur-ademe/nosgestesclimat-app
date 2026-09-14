import { findLatestCompletedPollSimulation } from '../../simulations/repository/simulation.repository.ts'
import { resolveAnonymity } from '../helpers/anonymity-policy.ts'
import { countPollParticipants } from '../repositories/poll-participation.repository.ts'
import { findPollByIdOrSlugInOrganisation } from '../repositories/poll.repository.ts'
import { resolveCooldownSeconds } from '../stats/helpers/cooldown-policy.ts'
import { pollStatsCooldownTiers } from '../stats/helpers/poll-stats-cooldown-tiers.ts'
import { findPollStats } from '../stats/repositories/poll-stats.repository.ts'
import type { PollResult } from '../types/poll-result.ts'

/**
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
  const [participants, userParticipation, stats] = await Promise.all([
    countPollParticipants(poll.id),
    userId ? findLatestCompletedPollSimulation({ userId, pollIdOrSlug }) : null,
    findPollStats({ pollId: poll.id }),
  ])

  const base = {
    poll,
    cooldownSeconds: resolveCooldownSeconds(
      pollStatsCooldownTiers,
      participants
    ),
    participants,
    userParticipation,
  }

  const anonymity = resolveAnonymity(participants)

  if (!anonymity.isReached) {
    return { ...base, anonymity, stats: null }
  }

  return { ...base, anonymity, stats }
}
