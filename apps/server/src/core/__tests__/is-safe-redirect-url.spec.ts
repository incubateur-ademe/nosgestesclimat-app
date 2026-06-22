import { describe, expect, test } from 'vitest'
import { isSafeRedirectUrl } from '../allowed-urls.ts'

const up = (str: string) => new URLPattern(str)

describe('isSafeRedirectUrl', () => {
  describe('exact match (no wildcards)', () => {
    test('returns true for exact URL match', () => {
      expect(
        isSafeRedirectUrl('https://example.com/', [up('https://example.com/')])
      ).toBe(true)
    })

    test('returns true when input has no trailing slash (URL normalizes to /)', () => {
      expect(
        isSafeRedirectUrl('https://example.com', [up('https://example.com/')])
      ).toBe(true)
    })

    test('returns true for pattern without explicit path (defaults to /)', () => {
      expect(
        isSafeRedirectUrl('https://example.com', [up('https://example.com')])
      ).toBe(true)
    })

    test('returns false for different origin', () => {
      expect(
        isSafeRedirectUrl('https://evil.com/', [up('https://example.com/')])
      ).toBe(false)
    })

    test('returns false for different protocol', () => {
      expect(
        isSafeRedirectUrl('http://example.com/', [up('https://example.com/')])
      ).toBe(false)
    })

    test('returns false for subdomain when only apex is allowed', () => {
      expect(
        isSafeRedirectUrl('https://sub.example.com/', [
          up('https://example.com/'),
        ])
      ).toBe(false)
    })

    test('returns false for URL with path when pattern requires root', () => {
      expect(
        isSafeRedirectUrl('https://example.com/path', [
          up('https://example.com/'),
        ])
      ).toBe(false)
    })

    test('returns true for exact path match', () => {
      expect(
        isSafeRedirectUrl('https://example.com/callback', [
          up('https://example.com/callback'),
        ])
      ).toBe(true)
    })

    test('returns false for different path', () => {
      expect(
        isSafeRedirectUrl('https://example.com/other', [
          up('https://example.com/callback'),
        ])
      ).toBe(false)
    })

    test('query params are ignored', () => {
      expect(
        isSafeRedirectUrl('https://example.com/?foo=bar', [
          up('https://example.com/'),
        ])
      ).toBe(true)
    })

    test('hash fragment is ignored', () => {
      expect(
        isSafeRedirectUrl('https://example.com/#section', [
          up('https://example.com/'),
        ])
      ).toBe(true)
    })

    test('port must match exactly', () => {
      expect(
        isSafeRedirectUrl('https://example.com:8080/', [
          up('https://example.com:8080/'),
        ])
      ).toBe(true)
    })

    test('returns false for different port', () => {
      expect(
        isSafeRedirectUrl('https://example.com:9000/', [
          up('https://example.com:8080/'),
        ])
      ).toBe(false)
    })

    test('returns false for invalid URL', () => {
      expect(isSafeRedirectUrl('not-a-url', [up('https://example.com/')])).toBe(
        false
      )
    })

    test('returns false for empty string', () => {
      expect(isSafeRedirectUrl('', [up('https://example.com/')])).toBe(false)
    })

    test('returns false for relative URL', () => {
      expect(isSafeRedirectUrl('/path', [up('https://example.com/')])).toBe(
        false
      )
    })

    test('returns true when one of multiple patterns matches', () => {
      expect(
        isSafeRedirectUrl('https://b.com/', [
          up('https://a.com/'),
          up('https://b.com/'),
        ])
      ).toBe(true)
    })
  })

  describe('hostname wildcard (*)', () => {
    test('https://*.example.com/ matches www.example.com/', () => {
      expect(
        isSafeRedirectUrl('https://www.example.com/', [
          up('https://*.example.com/'),
        ])
      ).toBe(true)
    })

    test('https://*.example.com/ matches app.example.com/', () => {
      expect(
        isSafeRedirectUrl('https://app.example.com/', [
          up('https://*.example.com/'),
        ])
      ).toBe(true)
    })

    test('https://*.example.com/ does not match example.com/ (no subdomain)', () => {
      expect(
        isSafeRedirectUrl('https://example.com/', [
          up('https://*.example.com/'),
        ])
      ).toBe(false)
    })

    test('prefix-*.example.com/ matches prefix-pr1850.example.com/', () => {
      expect(
        isSafeRedirectUrl(
          'https://nosgestesclimat-site-preprod-pr1850.example.com/',
          [up('https://nosgestesclimat-site-preprod-*.example.com/')]
        )
      ).toBe(true)
    })

    test('prefix-*.example.com/ does not match different-pr1850.example.com/', () => {
      expect(
        isSafeRedirectUrl('https://other-pr1850.example.com/', [
          up('https://nosgestesclimat-site-preprod-*.example.com/'),
        ])
      ).toBe(false)
    })

    test('hostname wildcard matches multi-dot subdomain', () => {
      expect(
        isSafeRedirectUrl('https://sub2.sub1.example.com/', [
          up('https://*.example.com/'),
        ])
      ).toBe(true)
    })

    test('attacker domain cannot spoof allowed hostname wildcard', () => {
      expect(
        isSafeRedirectUrl('https://evilexample.com/', [
          up('https://*.example.com/'),
        ])
      ).toBe(false)
    })

    test('prefixed wildcard', () => {
      expect(
        isSafeRedirectUrl(
          'https://nosgestesclimat-site-preprod-pr123.osc-fr1.scalingo.io/',
          [up('https://nosgestesclimat-site-preprod-pr*.osc-fr1.scalingo.io/')]
        )
      ).toBe(true)
      expect(
        isSafeRedirectUrl(
          'https://nosgestesclimat-site-preprod-123.osc-fr1.scalingo.io/',
          [up('https://nosgestesclimat-site-preprod-pr*.osc-fr1.scalingo.io/')]
        )
      ).toBe(false)
    })
  })

  describe('hostname :group', () => {
    test('https://:sub.example.com/ matches sub.example.com/', () => {
      expect(
        isSafeRedirectUrl('https://sub.example.com/', [
          up('https://:sub.example.com/'),
        ])
      ).toBe(true)
    })

    test('https://:sub.example.com/ does not match evil.com.example.com/', () => {
      expect(
        isSafeRedirectUrl('https://evil.com.example.com/', [
          up('https://:sub.example.com/'),
        ])
      ).toBe(false)
    })
  })

  describe('path wildcard (*)', () => {
    test('https://www.example.com/* matches /path', () => {
      expect(
        isSafeRedirectUrl('https://www.example.com/path', [
          up('https://www.example.com/*'),
        ])
      ).toBe(true)
    })

    test('https://www.example.com/* matches / (root)', () => {
      expect(
        isSafeRedirectUrl('https://www.example.com/', [
          up('https://www.example.com/*'),
        ])
      ).toBe(true)
    })

    test('https://www.example.com/* matches /deep/nested/path', () => {
      expect(
        isSafeRedirectUrl('https://www.example.com/deep/nested/path', [
          up('https://www.example.com/*'),
        ])
      ).toBe(true)
    })

    test('path wildcard does not allow different origin', () => {
      expect(
        isSafeRedirectUrl('https://evil.com/path', [
          up('https://www.example.com/*'),
        ])
      ).toBe(false)
    })

    test('path wildcard ignores query params and hash', () => {
      expect(
        isSafeRedirectUrl('https://www.example.com/path?x=1#top', [
          up('https://www.example.com/*'),
        ])
      ).toBe(true)
    })
  })

  describe('URLPattern matching behavior', () => {
    test('appX2tonnes.org does not match app.2tonnes.org/* (dot not treated as regex wildcard)', () => {
      expect(
        isSafeRedirectUrl('https://appX2tonnes.org/fallback', [
          up('https://app.2tonnes.org/*'),
        ])
      ).toBe(false)
    })

    test('evil subdomain cannot match apex-only pattern', () => {
      expect(
        isSafeRedirectUrl('https://attacker.nosgestesclimat.fr/', [
          up('https://nosgestesclimat.fr/'),
        ])
      ).toBe(false)
    })

    test('protocol downgrade is rejected', () => {
      expect(
        isSafeRedirectUrl('http://nosgestesclimat.fr/', [
          up('https://nosgestesclimat.fr/'),
        ])
      ).toBe(false)
    })
  })
})
