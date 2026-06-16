import { describe, expect, test } from 'vitest'
import { isSafeRedirectUrl } from '../is-safe-redirect-url.ts'

describe('isSafeRedirectUrl', () => {
  describe('Basic URL validation', () => {
    test('returns true for exact matching origin with no path', () => {
      const result = isSafeRedirectUrl('https://example.com', [
        'https://example.com',
      ])
      expect(result).toBe(true)
    })

    test('returns true for origin with trailing slash', () => {
      const result = isSafeRedirectUrl('https://example.com/', [
        'https://example.com',
      ])
      expect(result).toBe(true)
    })

    test('returns false for URL with path when no allowedPaths specified', () => {
      const result = isSafeRedirectUrl('https://example.com/some/path', [
        'https://example.com',
      ])
      expect(result).toBe(false)
    })

    test('returns false for different origin', () => {
      const result = isSafeRedirectUrl('https://evil.com', [
        'https://example.com',
      ])
      expect(result).toBe(false)
    })

    test('returns false for different protocol', () => {
      const result = isSafeRedirectUrl('http://example.com', [
        'https://example.com',
      ])
      expect(result).toBe(false)
    })

    test('returns false for different subdomain', () => {
      const result = isSafeRedirectUrl('https://attacker.example.com', [
        'https://example.com',
      ])
      expect(result).toBe(false)
    })
  })

  describe('Allowed paths validation', () => {
    test('returns true for allowed path', () => {
      const result = isSafeRedirectUrl(
        'https://example.com/api/callback',
        ['https://example.com'],
        ['/api/callback']
      )
      expect(result).toBe(true)
    })

    test('returns false for disallowed path', () => {
      const result = isSafeRedirectUrl(
        'https://example.com/api/other',
        ['https://example.com'],
        ['/api/callback']
      )
      expect(result).toBe(false)
    })

    test('returns true for root path when allowed', () => {
      const result = isSafeRedirectUrl(
        'https://example.com/',
        ['https://example.com'],
        ['/']
      )
      expect(result).toBe(true)
    })

    test('returns true for path with trailing slash when normalized', () => {
      const result = isSafeRedirectUrl(
        'https://example.com/api/callback/',
        ['https://example.com'],
        ['/api/callback']
      )
      expect(result).toBe(true)
    })

    test('returns false for path without trailing slash when allowed path has trailing slash', () => {
      const result = isSafeRedirectUrl(
        'https://example.com/api/callback',
        ['https://example.com'],
        ['/api/callback/']
      )
      // Note: allowedPaths are not normalized, so trailing slashes must match exactly
      expect(result).toBe(false)
    })

    test('returns false for both with trailing slash in different places', () => {
      const result = isSafeRedirectUrl(
        'https://example.com/api/callback/',
        ['https://example.com'],
        ['/api/callback/']
      )
      // The URL pathname is normalized (trailing slash removed), but allowedPaths are not
      expect(result).toBe(false)
    })

    test('returns true for multiple allowed paths', () => {
      const result = isSafeRedirectUrl(
        'https://example.com/api/logout',
        ['https://example.com'],
        ['/api/callback', '/api/logout', '/api/auth']
      )
      expect(result).toBe(true)
    })

    test('returns true for empty path when root is allowed', () => {
      const result = isSafeRedirectUrl(
        'https://example.com',
        ['https://example.com'],
        ['/']
      )
      expect(result).toBe(true)
    })
  })

  describe('RegExp origin patterns', () => {
    test('returns true for matching RegExp pattern', () => {
      const result = isSafeRedirectUrl('https://sub.example.com', [
        /^https:\/\/.*\.example\.com$/,
      ])
      expect(result).toBe(true)
    })

    test('returns false for non-matching RegExp pattern', () => {
      const result = isSafeRedirectUrl('https://evil.com', [
        /^https:\/\/.*\.example\.com$/,
      ])
      expect(result).toBe(false)
    })

    test('works with mixed string and RegExp allowedOrigins', () => {
      const result = isSafeRedirectUrl('https://sub.example.com', [
        'https://example.com',
        /^https:\/\/.*\.example\.com$/,
      ])
      expect(result).toBe(true)
    })

    test('works with RegExp and allowed paths', () => {
      const result = isSafeRedirectUrl(
        'https://sub.example.com/api/callback',
        [/^https:\/\/.*\.example\.com$/],
        ['/api/callback']
      )
      expect(result).toBe(true)
    })
  })

  describe('Edge cases and error handling', () => {
    test('returns false for invalid URL', () => {
      const result = isSafeRedirectUrl('not-a-valid-url', [
        'https://example.com',
      ])
      expect(result).toBe(false)
    })

    test('returns false for empty URL', () => {
      const result = isSafeRedirectUrl('', ['https://example.com'])
      expect(result).toBe(false)
    })

    test('returns false for URL without protocol', () => {
      const result = isSafeRedirectUrl('example.com', ['https://example.com'])
      expect(result).toBe(false)
    })

    test('returns false for relative URL', () => {
      const result = isSafeRedirectUrl('/some/path', ['https://example.com'])
      expect(result).toBe(false)
    })

    test('handles port numbers correctly', () => {
      const result = isSafeRedirectUrl('https://example.com:8080', [
        'https://example.com:8080',
      ])
      expect(result).toBe(true)
    })

    test('returns false for different port', () => {
      const result = isSafeRedirectUrl('https://example.com:8080', [
        'https://example.com',
      ])
      expect(result).toBe(false)
    })

    test('handles query parameters (should ignore them for validation)', () => {
      const result = isSafeRedirectUrl('https://example.com?param=value', [
        'https://example.com',
      ])
      expect(result).toBe(true)
    })

    test('handles hash fragments (should ignore them for validation)', () => {
      const result = isSafeRedirectUrl('https://example.com#section', [
        'https://example.com',
      ])
      expect(result).toBe(true)
    })

    test('handles query and hash with allowed path', () => {
      const result = isSafeRedirectUrl(
        'https://example.com/api/callback?code=123#top',
        ['https://example.com'],
        ['/api/callback']
      )
      expect(result).toBe(true)
    })
  })

  describe('Multiple allowed origins', () => {
    test('returns true for second allowed origin', () => {
      const result = isSafeRedirectUrl('https://example2.com', [
        'https://example.com',
        'https://example2.com',
      ])
      expect(result).toBe(true)
    })

    test('returns true for third allowed origin', () => {
      const result = isSafeRedirectUrl(
        'https://example3.com/path',
        ['https://example.com', 'https://example2.com', 'https://example3.com'],
        ['/path']
      )
      expect(result).toBe(true)
    })
  })

  describe('Origin normalization', () => {
    test('handles trailing slash in allowed origin', () => {
      const result = isSafeRedirectUrl('https://example.com', [
        'https://example.com/',
      ])
      expect(result).toBe(true)
    })

    test('handles mixed trailing slashes', () => {
      const result = isSafeRedirectUrl('https://example.com/', [
        'https://example.com/',
      ])
      expect(result).toBe(true)
    })
  })

  describe('Case sensitivity', () => {
    test('origin comparison is case-sensitive for protocol', () => {
      const result = isSafeRedirectUrl('HTTPS://example.com', [
        'https://example.com',
      ])
      // URL constructor normalizes protocol to lowercase
      expect(result).toBe(true)
    })

    test('origin comparison is case-insensitive for hostname', () => {
      const result = isSafeRedirectUrl('https://EXAMPLE.COM', [
        'https://example.com',
      ])
      // URL constructor normalizes hostname to lowercase
      expect(result).toBe(true)
    })
  })
})
