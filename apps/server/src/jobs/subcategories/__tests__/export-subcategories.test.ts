import { describe, expect, it } from 'vitest'
import { isValidDateOnly, resolvePeriod } from '../lib/period.ts'
import { sanitizeDatabaseUrl } from '../lib/postgres.ts'
import {
  findExtraRules,
  getBaseRules,
  getReleaseVersion,
  getRulesSet,
  isEmptyRule,
} from '../lib/rules.ts'
import { buildKey } from '../lib/storage.ts'

describe('resolvePeriod', () => {
  it('covers the whole month with --period', () => {
    expect(resolvePeriod({ period: '2026-01' })).toEqual({
      period: '2026-01',
      startDate: '2026-01-01 00:00:00',
      endDate: '2026-02-01 00:00:00',
    })
  })

  it('handles December (year rollover)', () => {
    expect(resolvePeriod({ period: '2026-12' }).endDate).toBe(
      '2027-01-01 00:00:00'
    )
  })

  it('includes the whole --end-date day', () => {
    expect(
      resolvePeriod({ startDate: '2026-01-01', endDate: '2026-01-31' })
    ).toEqual({
      period: '2026-01',
      startDate: '2026-01-01 00:00:00',
      endDate: '2026-02-01 00:00:00',
    })
  })

  it('rejects a malformed period', () => {
    expect(() => resolvePeriod({ period: '2026-1' })).toThrow(/--period/)
    expect(() => resolvePeriod({})).toThrow(/--period/)
  })

  it('rejects a non-existent date', () => {
    expect(() =>
      resolvePeriod({ period: '2026-02', startDate: '2026-02-30' })
    ).toThrow(/--start-date/)
  })
})

describe('isValidDateOnly', () => {
  it('accepts a real date and rejects February 30', () => {
    expect(isValidDateOnly('2026-02-28')).toBe(true)
    expect(isValidDateOnly('2026-02-30')).toBe(false)
    expect(isValidDateOnly('2026-2-1')).toBe(false)
  })
})

describe('sanitizeDatabaseUrl', () => {
  it('drops the Prisma parameters libpq does not understand', () => {
    const sanitized = sanitizeDatabaseUrl(
      'postgres://user:pass@host:5432/db?sslmode=require&connection_limit=5'
    )
    expect(sanitized).toContain('sslmode=require')
    expect(sanitized).not.toContain('connection_limit')
  })

  it('leaves a URL without parameters untouched', () => {
    expect(sanitizeDatabaseUrl('postgres://host:5432/db')).toBe(
      'postgres://host:5432/db'
    )
  })
})

describe('buildKey', () => {
  it('stores exports under ngc/export-subcategories/<period>/', () => {
    expect(buildKey('2026-01', 'sous-categories-2026-01.csv')).toBe(
      'ngc/export-subcategories/2026-01/sous-categories-2026-01.csv'
    )
  })

  it('stores the rules cache under the ngc/ prefix required by the bucket policy', () => {
    expect(buildKey('_model-cache', '4.17.3.json')).toBe(
      'ngc/export-subcategories/_model-cache/4.17.3.json'
    )
  })

  it('ignores an empty filename', () => {
    expect(buildKey('2026-01', '')).toBe('ngc/export-subcategories/2026-01')
  })
})

describe('getReleaseVersion', () => {
  it('maps a pre-release to its published version', () => {
    expect(getReleaseVersion('4.13.0-rc.2')).toBe('4.13.0')
    expect(getReleaseVersion('4.17.3')).toBe('4.17.3')
  })

  it('rejects versions that are not on npm', () => {
    expect(getReleaseVersion('pr-2808')).toBeNull()
  })
})

describe('rules catalogue', () => {
  it('covers 4.6.0 and above, and nothing below', () => {
    expect(getRulesSet('4.6.0')).not.toBeNull()
    expect(getRulesSet('4.5.2')).toBeNull()
    expect(getRulesSet('4.17.3')).not.toBeNull()
  })

  it('stacks variants in the expected order', () => {
    expect(getRulesSet('4.17.3')?.files).toEqual(['subcategories.yaml'])
    expect(getRulesSet('4.13.0')?.files).toEqual([
      'subcategories.yaml',
      'subcategories.before-4.16.0.yaml',
    ])
    expect(getRulesSet('4.6.0')?.files).toEqual([
      'subcategories.yaml',
      'subcategories.before-4.16.0.yaml',
      'subcategories.before-4.10.1.yaml',
      'subcategories.before-4.10.0.yaml',
      'subcategories.before-4.9.1.yaml',
    ])
  })

  it('introduces no rule absent from the base file', () => {
    expect(findExtraRules(getBaseRules())).toEqual([])
  })

  it('exposes 104 evaluable columns', () => {
    const base = getBaseRules()
    const columns = Object.keys(base).filter((name) => !isEmptyRule(base[name]))
    expect(columns).toHaveLength(104)
  })
})
