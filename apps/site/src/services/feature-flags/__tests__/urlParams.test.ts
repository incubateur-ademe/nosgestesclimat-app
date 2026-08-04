import { describe, expect, it, vi } from 'vitest'

vi.mock('../flags', () => ({
  FLAGS: {
    'boolean-flag': { kind: 'boolean' },
    variant: { kind: 'variant', variants: ['control', 'test'] },
  },
}))

import {
  parseFeatureFlagCookie,
  parseFeatureFlagParams,
  stripFeatureFlagParams,
} from '../urlParams'

describe('parseFeatureFlagParams', () => {
  it('returns null when no ff_ params are present', () => {
    expect(parseFeatureFlagParams(new URLSearchParams('?sid=123'))).toBeNull()
  })

  it('parses a single truthy flag', () => {
    expect(
      parseFeatureFlagParams(new URLSearchParams('?ff_boolean-flag=true'))
    ).toEqual({ 'boolean-flag': true })
  })

  it('parses a single falsy flag', () => {
    expect(
      parseFeatureFlagParams(new URLSearchParams('?ff_boolean-flag=false'))
    ).toEqual({ 'boolean-flag': false })
  })

  it('parses a known variant value', () => {
    expect(
      parseFeatureFlagParams(new URLSearchParams('?ff_variant=test'))
    ).toEqual({ variant: 'test' })
  })

  it('ignores unknown variant value', () => {
    expect(
      parseFeatureFlagParams(new URLSearchParams('?ff_variant=wrong'))
    ).toBeNull()
  })

  it('ignores non-boolean values on boolean flags', () => {
    expect(
      parseFeatureFlagParams(new URLSearchParams('?ff_boolean-flag=test'))
    ).toBeNull()
  })

  it('ignores flags not in FLAGS', () => {
    expect(
      parseFeatureFlagParams(new URLSearchParams('?ff_unknown=true'))
    ).toBeNull()
  })
})

describe('stripFeatureFlagParams', () => {
  it('removes ff_ params while keeping others', () => {
    expect(
      stripFeatureFlagParams(
        new URL('https://example.com/page?ff_flag=true&sid=123')
      ).search
    ).toBe('?sid=123')
  })
})

describe('parseFeatureFlagCookie', () => {
  it('parses a valid JSON cookie value', () => {
    expect(parseFeatureFlagCookie('{"boolean-flag":true}')).toEqual({
      'boolean-flag': true,
    })
  })

  it('parses a variant override', () => {
    expect(parseFeatureFlagCookie('{"variant":"test"}')).toEqual({
      variant: 'test',
    })
  })

  it('returns empty object for undefined, empty, or malformed input', () => {
    expect(parseFeatureFlagCookie(undefined)).toEqual({})
    expect(parseFeatureFlagCookie('')).toEqual({})
    expect(parseFeatureFlagCookie('not-json')).toEqual({})
  })
})
