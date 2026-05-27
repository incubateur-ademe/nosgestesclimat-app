import { describe, expect, it } from 'vitest'
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
      parseFeatureFlagParams(new URLSearchParams('?ff_my-flag=true'))
    ).toEqual({ 'my-flag': true })
  })

  it('parses a single falsy flag', () => {
    expect(
      parseFeatureFlagParams(new URLSearchParams('?ff_my-flag=false'))
    ).toEqual({ 'my-flag': false })
  })

  it('keeps non-boolean values as strings', () => {
    expect(
      parseFeatureFlagParams(new URLSearchParams('?ff_variant-flag=test'))
    ).toEqual({ 'variant-flag': 'test' })
  })

  it('ignores empty values', () => {
    expect(
      parseFeatureFlagParams(new URLSearchParams('?ff_flag='))
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
    expect(parseFeatureFlagCookie('{"actions-v2":true}')).toEqual({
      'actions-v2': true,
    })
  })

  it('parses a variant override', () => {
    expect(
      parseFeatureFlagCookie('{"ab-test-tranche":"test"}')
    ).toEqual({ 'ab-test-tranche': 'test' })
  })

  it('returns empty object for undefined, empty, or malformed input', () => {
    expect(parseFeatureFlagCookie(undefined)).toEqual({})
    expect(parseFeatureFlagCookie('')).toEqual({})
    expect(parseFeatureFlagCookie('not-json')).toEqual({})
  })
})
