import { describe, expect, it } from 'vitest'
import {
  parseCooldownTiers,
  resolveCooldownSeconds,
} from '../cooldown-policy.ts'

const DEFAULT_TIERS = [
  { upTo: 100, cooldownSeconds: 0 },
  { upTo: 1000, cooldownSeconds: 900 },
  { upTo: null, cooldownSeconds: 14400 },
]

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

  it('parses hour units', () => {
    expect(parseCooldownTiers('10:4h')).toEqual([
      { upTo: 10, cooldownSeconds: 14400 },
    ])
  })

  it('falls back to the default tiers when the input is undefined', () => {
    expect(parseCooldownTiers(undefined)).toEqual(DEFAULT_TIERS)
  })

  it('falls back to the default tiers when the input is empty', () => {
    expect(parseCooldownTiers('')).toEqual(DEFAULT_TIERS)
  })

  it('throws on malformed input', () => {
    expect(() => parseCooldownTiers('50:not-a-number')).toThrow(
      'Invalid cooldown value'
    )
  })
})

describe('resolveCooldownSeconds', () => {
  const tiers = [
    { upTo: 100, cooldownSeconds: 0 },
    { upTo: 1000, cooldownSeconds: 900 },
    { upTo: null, cooldownSeconds: 14400 },
  ]

  it('returns the cooldown of the first matching tier', () => {
    expect(resolveCooldownSeconds(tiers, 100)).toBe(0)
    expect(resolveCooldownSeconds(tiers, 101)).toBe(900)
    expect(resolveCooldownSeconds(tiers, 1000)).toBe(900)
    expect(resolveCooldownSeconds(tiers, 1001)).toBe(14400)
  })
})
