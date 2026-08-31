const DEFAULT_COOLDOWN_TIERS = '100:0s|1000:15m|4h'

export interface CooldownTier {
  // null means no upper bound (default tier)
  upTo: number | null
  cooldownSeconds: number
}

const parseSeconds = (value: string): number => {
  const match = /^(\d+)(h|m|s)?$/.exec(value.trim())
  if (!match) {
    throw new Error(`Invalid cooldown value "${value}"`)
  }
  const [, amount, unit] = match
  return Number(amount) * (unit === 'h' ? 3600 : unit === 'm' ? 60 : 1)
}

/**
 * Parses a tier configuration string of the form
 * `threshold:cooldown|threshold:cooldown|defaultCooldown` (e.g.
 * `100:0s|1000:15m|4h`). Cooldowns accept an `s` (seconds), `m` (minutes) or
 * `h` (hours) suffix; without a suffix they are in seconds. Throws on invalid
 * input.
 */
export const parseCooldownTiers = (raw: string): CooldownTier[] =>
  raw.split('|').map((part) => {
    const [threshold, cooldown] = part.trim().split(':')
    if (!cooldown) {
      return { upTo: null, cooldownSeconds: parseSeconds(threshold) }
    }
    return { upTo: Number(threshold), cooldownSeconds: parseSeconds(cooldown) }
  })

const loadCooldownTiersFromEnv = (): CooldownTier[] => {
  const raw = process.env.POLL_STATS_COOLDOWN_TIERS
  if (!raw) {
    return parseCooldownTiers(DEFAULT_COOLDOWN_TIERS)
  }
  try {
    return parseCooldownTiers(raw)
  } catch {
    return parseCooldownTiers(DEFAULT_COOLDOWN_TIERS)
  }
}

/**
 * Resolves the minimum delay between two recomputations for a given
 * participation count and a set of cooldown tiers.
 */
export const resolveCooldownSeconds = (
  tiers: CooldownTier[],
  count: number
): number => {
  for (const tier of tiers) {
    if (tier.upTo === null || count <= tier.upTo) {
      return tier.cooldownSeconds
    }
  }
  return tiers[tiers.length - 1].cooldownSeconds
}

const cooldownTiers = loadCooldownTiersFromEnv()

/**
 * Maps a poll's participation count to the minimum delay between two
 * recomputations. Small polls are recomputed immediately (0s); larger polls
 * are throttled so a burst of simulations does not trigger a recompute every
 * time.
 */
export const resolvePollStatsCooldownSeconds = (count: number): number =>
  resolveCooldownSeconds(cooldownTiers, count)
