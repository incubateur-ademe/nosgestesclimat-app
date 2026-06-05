import { describe, expect, it } from 'vitest'
import { parseModelString, serializeModel } from '../model.mapper.ts'

describe('parseModelString', () => {
  it('parses a published tag version', () => {
    const result = parseModelString('FR-fr-1.2.3')
    expect(result).toEqual({
      region: 'FR',
      locale: 'fr',
      version: { publishedTag: '1.2.3' },
    })
  })

  it('parses a PR number version', () => {
    const result = parseModelString('FR-fr-pr-42')
    expect(result).toEqual({
      region: 'FR',
      locale: 'fr',
      version: { PRNumber: '42' },
    })
  })

  it('parses with English locale', () => {
    const result = parseModelString('EU-en-2.0.0')
    expect(result).toEqual({
      region: 'EU',
      locale: 'en',
      version: { publishedTag: '2.0.0' },
    })
  })

  it('returns null for an invalid locale', () => {
    expect(parseModelString('FR-de-1.0.0')).toBeNull()
  })

  it('returns null for an invalid version format', () => {
    expect(parseModelString('FR-fr-gibberish')).toBeNull()
  })

  it('returns null for a completely invalid string', () => {
    expect(parseModelString('not-a-model')).toBeNull()
  })

  it('returns null for an empty string', () => {
    expect(parseModelString('')).toBeNull()
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
