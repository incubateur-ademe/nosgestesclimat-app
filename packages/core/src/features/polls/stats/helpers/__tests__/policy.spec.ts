import { describe, expect, it } from 'vitest'
import { parseCooldownTiers, resolveCooldownSeconds } from '../policy.ts'

describe('parseCooldownTiers', () => {
  it('parses threshold:cooldown pairs', () => {
    expect(parseCooldownTiers('10:5s|100:30s')).toEqual([
      { upTo: 10, cooldownSeconds: 5 },
      { upTo: 100, cooldownSeconds: 30 },
    ])
  })

  it('parses a default tier without a threshold', () => {
    expect(parseCooldownTiers('10:5s|120s')).toEqual([
      { upTo: 10, cooldownSeconds: 5 },
      { upTo: null, cooldownSeconds: 120 },
    ])
  })

  it('parses minute units', () => {
    expect(parseCooldownTiers('50:5m')).toEqual([
      { upTo: 50, cooldownSeconds: 300 },
    ])
  })

  it('throws on invalid cooldown values', () => {
    expect(() => parseCooldownTiers('50:not-a-number')).toThrow()
  })
})

describe('resolveCooldownSeconds', () => {
  const tiers = [
    { upTo: 50, cooldownSeconds: 0 },
    { upTo: 1000, cooldownSeconds: 60 },
    { upTo: null, cooldownSeconds: 300 },
  ]

  it('returns the cooldown of the first matching tier', () => {
    expect(resolveCooldownSeconds(tiers, 50)).toBe(0)
    expect(resolveCooldownSeconds(tiers, 51)).toBe(60)
    expect(resolveCooldownSeconds(tiers, 1001)).toBe(300)
  })
})
