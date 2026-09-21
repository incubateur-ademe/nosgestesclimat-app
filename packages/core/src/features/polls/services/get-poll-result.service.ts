import { findLatestCompletedPollSimulation } from '../../simulations/repository/simulation.repository.ts'
import { resolveAnonymity } from '../helpers/anonymity-policy.ts'
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
  // The participation does not depend on the poll, so both are read at once.
  const [poll, userParticipation] = await Promise.all([
    findPollByIdOrSlugInOrganisation({ pollIdOrSlug, organisationSlug }),
    userId ? findLatestCompletedPollSimulation({ userId, pollIdOrSlug }) : null,
  ])
  if (!poll) return null

  const participantsCount = poll.participantsCount
  const anonymity = resolveAnonymity(participantsCount)

  const base = {
    poll,
    cooldownSeconds: resolveCooldownSeconds(
      pollStatsCooldownTiers,
      participantsCount
    ),
    participantsCount,
    userParticipation,
  }

  // The threshold governs the read, not only what comes out of it: a withheld
  // poll's stats are never loaded.
  if (!anonymity.isReached) {
    return { ...base, anonymity, stats: null }
  }

  return { ...base, anonymity, stats: await findPollStats({ pollId: poll.id }) }
}
