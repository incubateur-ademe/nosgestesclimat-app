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

const parseRaw = (raw: string): CooldownTier[] =>
  raw.split('|').map((part) => {
    const [threshold, cooldown] = part.trim().split(':')
    if (!cooldown) {
      return { upTo: null, cooldownSeconds: parseSeconds(threshold) }
    }
    return { upTo: Number(threshold), cooldownSeconds: parseSeconds(cooldown) }
  })

/**
 * Parses a cooldown tier configuration string of the form
 * `threshold:cooldown|threshold:cooldown|defaultCooldown` (e.g.
 * `100:0s|1000:15m|4h`). Cooldowns accept an `s` (seconds), `m` (minutes) or
 * `h` (hours) suffix; without a suffix they are in seconds. An empty or
 * undefined input yields the default tiers. Throws on malformed input.
 */
export const parseCooldownTiers = (raw: string | undefined): CooldownTier[] => {
  const input = raw?.trim()
  if (!input) {
    return parseRaw(DEFAULT_COOLDOWN_TIERS)
  }
  return parseRaw(input)
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
