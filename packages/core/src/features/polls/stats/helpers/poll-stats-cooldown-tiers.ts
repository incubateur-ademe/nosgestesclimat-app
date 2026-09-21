import { parseCooldownTiers } from './cooldown-policy.ts'

/**
 * Resolved once per process. The worker schedules recomputations from these
 * tiers and the poll result read advertises the delay they produce, so a second
 * resolution of the same variable could drift apart.
 */
export const pollStatsCooldownTiers = parseCooldownTiers(
  process.env.POLL_STATS_COOLDOWN_TIERS
)
