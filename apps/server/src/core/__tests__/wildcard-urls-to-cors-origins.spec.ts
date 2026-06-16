import { describe, expect, test } from 'vitest'
import { wildcardUrlsToCorsOrigins } from '../allowed-urls.ts'

describe('wildcardUrlsToCorsOrigins', () => {
  test('exact pattern yields origin string (path stripped, no trailing slash)', () => {
    expect(wildcardUrlsToCorsOrigins(['https://example.com/'])).toEqual([
      'https://example.com',
    ])
  })

  test('exact pattern without path also works', () => {
    expect(wildcardUrlsToCorsOrigins(['https://example.com'])).toEqual([
      'https://example.com',
    ])
  })

  test('wildcard pattern yields RegExp matching one subdomain segment', () => {
    const [result] = wildcardUrlsToCorsOrigins(['https://*.example.com/'])
    expect(result).toBeInstanceOf(RegExp)
    expect((result as RegExp).test('https://sub.example.com')).toBe(true)
    expect((result as RegExp).test('https://example.com')).toBe(false)
    expect((result as RegExp).test('https://sub.sub.example.com')).toBe(false)
  })

  test('prefix wildcard yields RegExp matching prefix-segment pattern', () => {
    const [result] = wildcardUrlsToCorsOrigins([
      'https://preprod-*.example.com/',
    ])
    expect(result).toBeInstanceOf(RegExp)
    expect((result as RegExp).test('https://preprod-pr1850.example.com')).toBe(
      true
    )
    expect((result as RegExp).test('https://other-pr1850.example.com')).toBe(
      false
    )
  })

  test('dots in origin string are escaped (not treated as regex wildcards)', () => {
    const [result] = wildcardUrlsToCorsOrigins(['https://app.2tonnes.org/'])
    expect(result).toBe('https://app.2tonnes.org')
  })

  test('converts multiple patterns, mixing strings and regexps', () => {
    const results = wildcardUrlsToCorsOrigins([
      'https://nosgestesclimat.fr/',
      'https://*.vercel.app/',
    ])
    expect(results[0]).toBe('https://nosgestesclimat.fr')
    expect(results[1]).toBeInstanceOf(RegExp)
    expect((results[1] as RegExp).test('https://myapp.vercel.app')).toBe(true)
    expect((results[1] as RegExp).test('https://vercel.app')).toBe(false)
  })
})
