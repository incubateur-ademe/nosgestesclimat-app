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
  it('couvre le mois entier avec --period', () => {
    expect(resolvePeriod({ period: '2026-01' })).toEqual({
      period: '2026-01',
      startDate: '2026-01-01 00:00:00',
      endDate: '2026-02-01 00:00:00',
    })
  })

  it('gère décembre (passage d’année)', () => {
    expect(resolvePeriod({ period: '2026-12' }).endDate).toBe(
      '2027-01-01 00:00:00'
    )
  })

  it('inclut la journée de --end-date', () => {
    expect(
      resolvePeriod({ startDate: '2026-01-01', endDate: '2026-01-31' })
    ).toEqual({
      period: '2026-01',
      startDate: '2026-01-01 00:00:00',
      endDate: '2026-02-01 00:00:00',
    })
  })

  it('rejette une période mal formée', () => {
    expect(() => resolvePeriod({ period: '2026-1' })).toThrow(/--period/)
    expect(() => resolvePeriod({})).toThrow(/--period/)
  })

  it('rejette une date inexistante', () => {
    expect(() =>
      resolvePeriod({ period: '2026-02', startDate: '2026-02-30' })
    ).toThrow(/--start-date/)
  })
})

describe('isValidDateOnly', () => {
  it('accepte une date réelle et rejette le 30 février', () => {
    expect(isValidDateOnly('2026-02-28')).toBe(true)
    expect(isValidDateOnly('2026-02-30')).toBe(false)
    expect(isValidDateOnly('2026-2-1')).toBe(false)
  })
})

describe('sanitizeDatabaseUrl', () => {
  it('retire les paramètres Prisma incompris de libpq', () => {
    const sanitized = sanitizeDatabaseUrl(
      'postgres://user:pass@host:5432/db?sslmode=require&connection_limit=5'
    )
    expect(sanitized).toContain('sslmode=require')
    expect(sanitized).not.toContain('connection_limit')
  })

  it('préserve l’URL sans paramètres', () => {
    expect(sanitizeDatabaseUrl('postgres://host:5432/db')).toBe(
      'postgres://host:5432/db'
    )
  })
})

describe('buildKey', () => {
  it('range les exports sous ngc/export-subcategories/<période>/', () => {
    expect(buildKey('2026-01', 'sous-categories-2026-01.csv')).toBe(
      'ngc/export-subcategories/2026-01/sous-categories-2026-01.csv'
    )
  })

  it('ignore un nom de fichier vide', () => {
    expect(buildKey('2026-01', '')).toBe('ngc/export-subcategories/2026-01')
  })
})

describe('getReleaseVersion', () => {
  it('rattache une pré-version à sa version publiée', () => {
    expect(getReleaseVersion('4.13.0-rc.2')).toBe('4.13.0')
    expect(getReleaseVersion('4.17.3')).toBe('4.17.3')
  })

  it('rejette les versions hors npm', () => {
    expect(getReleaseVersion('pr-2808')).toBeNull()
  })
})

describe('catalogue de règles', () => {
  it('couvre 4.6.0 et au-delà, et rien en dessous', () => {
    expect(getRulesSet('4.6.0')).not.toBeNull()
    expect(getRulesSet('4.5.2')).toBeNull()
    expect(getRulesSet('4.17.3')).not.toBeNull()
  })

  it('empile les variantes dans l’ordre attendu', () => {
    expect(getRulesSet('4.17.3')?.files).toEqual(['subcategories.yaml'])
    expect(getRulesSet('4.13.0')?.files).toEqual([
      'subcategories.yaml',
      'subcategories.avant-4.16.0.yaml',
    ])
    expect(getRulesSet('4.6.0')?.files).toEqual([
      'subcategories.yaml',
      'subcategories.avant-4.16.0.yaml',
      'subcategories.avant-4.10.1.yaml',
      'subcategories.avant-4.10.0.yaml',
      'subcategories.avant-4.9.1.yaml',
    ])
  })

  it('n’introduit aucune règle absente du fichier de base', () => {
    expect(findExtraRules(getBaseRules())).toEqual([])
  })

  it('expose 104 colonnes évaluables', () => {
    const base = getBaseRules()
    const columns = Object.keys(base).filter((name) => !isEmptyRule(base[name]))
    expect(columns).toHaveLength(104)
  })
})
