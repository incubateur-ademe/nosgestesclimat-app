import { describe, expect, test } from 'vitest'
import { isSafeRedirectUrl } from '../allowed-urls.ts'

describe('isSafeRedirectUrl', () => {
  describe('exact match (no wildcards)', () => {
    test('returns true for exact URL match', () => {
      expect(
        isSafeRedirectUrl('https://example.com/', ['https://example.com/'])
      ).toBe(true)
    })

    test('returns true when input has no trailing slash (URL normalizes to /)', () => {
      expect(
        isSafeRedirectUrl('https://example.com', ['https://example.com/'])
      ).toBe(true)
    })

    test('returns true for pattern without explicit path (defaults to /)', () => {
      expect(
        isSafeRedirectUrl('https://example.com', ['https://example.com'])
      ).toBe(true)
    })

    test('returns false for different origin', () => {
      expect(
        isSafeRedirectUrl('https://evil.com/', ['https://example.com/'])
      ).toBe(false)
    })

    test('returns false for different protocol', () => {
      expect(
        isSafeRedirectUrl('http://example.com/', ['https://example.com/'])
      ).toBe(false)
    })

    test('returns false for subdomain when only apex is allowed', () => {
      expect(
        isSafeRedirectUrl('https://sub.example.com/', ['https://example.com/'])
      ).toBe(false)
    })

    test('returns false for URL with path when pattern requires root', () => {
      expect(
        isSafeRedirectUrl('https://example.com/path', ['https://example.com/'])
      ).toBe(false)
    })

    test('returns true for exact path match', () => {
      expect(
        isSafeRedirectUrl('https://example.com/callback', [
          'https://example.com/callback',
        ])
      ).toBe(true)
    })

    test('returns false for different path', () => {
      expect(
        isSafeRedirectUrl('https://example.com/other', [
          'https://example.com/callback',
        ])
      ).toBe(false)
    })

    test('query params are ignored', () => {
      expect(
        isSafeRedirectUrl('https://example.com/?foo=bar', [
          'https://example.com/',
        ])
      ).toBe(true)
    })

    test('hash fragment is ignored', () => {
      expect(
        isSafeRedirectUrl('https://example.com/#section', [
          'https://example.com/',
        ])
      ).toBe(true)
    })

    test('port must match exactly', () => {
      expect(
        isSafeRedirectUrl('https://example.com:8080/', [
          'https://example.com:8080/',
        ])
      ).toBe(true)
    })

    test('returns false for different port', () => {
      expect(
        isSafeRedirectUrl('https://example.com:9000/', [
          'https://example.com:8080/',
        ])
      ).toBe(false)
    })

    test('returns false for invalid URL', () => {
      expect(isSafeRedirectUrl('not-a-url', ['https://example.com/'])).toBe(
        false
      )
    })

    test('returns false for empty string', () => {
      expect(isSafeRedirectUrl('', ['https://example.com/'])).toBe(false)
    })

    test('returns false for relative URL', () => {
      expect(isSafeRedirectUrl('/path', ['https://example.com/'])).toBe(false)
    })

    test('returns true when one of multiple patterns matches', () => {
      expect(
        isSafeRedirectUrl('https://b.com/', [
          'https://a.com/',
          'https://b.com/',
        ])
      ).toBe(true)
    })
  })

  describe('hostname wildcard (*)', () => {
    test('https://*.example.com/ matches www.example.com/', () => {
      expect(
        isSafeRedirectUrl('https://www.example.com/', [
          'https://*.example.com/',
        ])
      ).toBe(true)
    })

    test('https://*.example.com/ matches app.example.com/', () => {
      expect(
        isSafeRedirectUrl('https://app.example.com/', [
          'https://*.example.com/',
        ])
      ).toBe(true)
    })

    test('https://*.example.com/ does not match example.com/ (no subdomain)', () => {
      expect(
        isSafeRedirectUrl('https://example.com/', ['https://*.example.com/'])
      ).toBe(false)
    })

    test('https://*.example.com/ does not match subsub.sub.example.com/ (two segments)', () => {
      expect(
        isSafeRedirectUrl('https://subsub.sub.example.com/', [
          'https://*.example.com/',
        ])
      ).toBe(false)
    })

    test('prefix-*.example.com/ matches prefix-pr1850.example.com/', () => {
      expect(
        isSafeRedirectUrl(
          'https://nosgestesclimat-site-preprod-pr1850.example.com/',
          ['https://nosgestesclimat-site-preprod-*.example.com/']
        )
      ).toBe(true)
    })

    test('prefix-*.example.com/ does not match different-pr1850.example.com/', () => {
      expect(
        isSafeRedirectUrl('https://other-pr1850.example.com/', [
          'https://nosgestesclimat-site-preprod-*.example.com/',
        ])
      ).toBe(false)
    })

    test('hostname wildcard rejects multi-dot subdomain (evil.com.example.com)', () => {
      // evil.com contains a dot, so single-segment * cannot match it
      expect(
        isSafeRedirectUrl('https://evil.com.example.com/', [
          'https://*.example.com/',
        ])
      ).toBe(false)
    })

    test('attacker domain cannot spoof allowed hostname wildcard', () => {
      expect(
        isSafeRedirectUrl('https://evilexample.com/', [
          'https://*.example.com/',
        ])
      ).toBe(false)
    })
  })

  describe('path wildcard (*)', () => {
    test('https://www.example.com/* matches /path', () => {
      expect(
        isSafeRedirectUrl('https://www.example.com/path', [
          'https://www.example.com/*',
        ])
      ).toBe(true)
    })

    test('https://www.example.com/* matches / (root)', () => {
      expect(
        isSafeRedirectUrl('https://www.example.com/', [
          'https://www.example.com/*',
        ])
      ).toBe(true)
    })

    test('https://www.example.com/* matches /deep/nested/path', () => {
      expect(
        isSafeRedirectUrl('https://www.example.com/deep/nested/path', [
          'https://www.example.com/*',
        ])
      ).toBe(true)
    })

    test('path wildcard does not allow different origin', () => {
      expect(
        isSafeRedirectUrl('https://evil.com/path', [
          'https://www.example.com/*',
        ])
      ).toBe(false)
    })

    test('path wildcard ignores query params and hash', () => {
      expect(
        isSafeRedirectUrl('https://www.example.com/path?x=1#top', [
          'https://www.example.com/*',
        ])
      ).toBe(true)
    })
  })

  describe('security: no false positives', () => {
    test('appX2tonnes.org does not match app.2tonnes.org/* (dot not treated as regex wildcard)', () => {
      expect(
        isSafeRedirectUrl('https://appX2tonnes.org/fallback', [
          'https://app.2tonnes.org/*',
        ])
      ).toBe(false)
    })

    test('evil subdomain cannot match apex-only pattern', () => {
      expect(
        isSafeRedirectUrl('https://attacker.nosgestesclimat.fr/', [
          'https://nosgestesclimat.fr/',
        ])
      ).toBe(false)
    })

    test('protocol downgrade is rejected', () => {
      expect(
        isSafeRedirectUrl('http://nosgestesclimat.fr/', [
          'https://nosgestesclimat.fr/',
        ])
      ).toBe(false)
    })
  })
})
