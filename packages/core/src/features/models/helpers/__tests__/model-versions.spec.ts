import { describe, expect, it } from 'vitest'
import {
  parseModel,
  parseModelVersion,
  serializeModel,
  serializeModelVersion,
} from '../model-versions.ts'

describe('parseModelVersion', () => {
  it('reads a published tag', () => {
    expect(parseModelVersion('4.14.2')).toEqual({
      publishedTag: '4.14.2',
    })
  })

  it('reads a prerelease published tag', () => {
    expect(parseModelVersion('4.15.0-beta.1')).toEqual({
      publishedTag: '4.15.0-beta.1',
    })
  })

  it('reads a PR reference', () => {
    expect(parseModelVersion('pr-1234')).toEqual({ PRNumber: '1234' })
  })

  it('returns null for anything else', () => {
    expect(parseModelVersion('current')).toBeNull()
    expect(parseModelVersion('4.14')).toBeNull()
    expect(parseModelVersion('')).toBeNull()
  })
})

describe('serializeModelVersion', () => {
  it('round-trips both forms', () => {
    for (const ref of ['4.14.2', 'pr-1234']) {
      expect(serializeModelVersion(parseModelVersion(ref)!)).toBe(ref)
    }
  })
})

describe('parseModel', () => {
  it('parses a published tag version', () => {
    const result = parseModel('FR-fr-1.2.3')
    expect(result).toEqual({
      region: 'FR',
      locale: 'fr',
      version: { publishedTag: '1.2.3' },
    })
  })

  it('parses a PR number version', () => {
    const result = parseModel('FR-fr-pr-42')
    expect(result).toEqual({
      region: 'FR',
      locale: 'fr',
      version: { PRNumber: '42' },
    })
  })

  it('parses with English locale', () => {
    const result = parseModel('EU-en-2.0.0')
    expect(result).toEqual({
      region: 'EU',
      locale: 'en',
      version: { publishedTag: '2.0.0' },
    })
  })

  it('returns null for an invalid locale', () => {
    expect(parseModel('FR-de-1.0.0')).toBeNull()
  })

  it('returns null for an invalid version format', () => {
    expect(parseModel('FR-fr-gibberish')).toBeNull()
  })

  it('returns null for a completely invalid string', () => {
    expect(parseModel('not-a-model')).toBeNull()
  })

  it('returns null for an empty string', () => {
    expect(parseModel('')).toBeNull()
  })
})

describe('serializeModel', () => {
  it('serializes a published tag model', () => {
    expect(
      serializeModel({
        region: 'FR',
        locale: 'fr',
        version: { publishedTag: '1.2.3' },
      })
    ).toBe('FR-fr-1.2.3')
  })

  it('serializes a PR number model', () => {
    expect(
      serializeModel({
        region: 'FR',
        locale: 'fr',
        version: { PRNumber: '42' },
      })
    ).toBe('FR-fr-pr-42')
  })

  it('serializes with English locale', () => {
    expect(
      serializeModel({
        region: 'EU',
        locale: 'en',
        version: { publishedTag: '2.0.0' },
      })
    ).toBe('EU-en-2.0.0')
  })
})
