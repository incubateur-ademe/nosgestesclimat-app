/**
 * Validates that a URL is safe for redirects, protecting against open redirect attacks.
 *
 * @param url - The URL to validate
 * @param allowedOrigins - List of allowed origins (strings or RegExp patterns)
 * @param allowedPaths - Optional list of allowed paths. If empty, only base URLs are allowed.
 * @returns true if the URL is safe for redirects, false otherwise
 *
 * @example
 * // Basic usage - only allow base URLs
 * isSafeRedirectUrl('https://example.com', ['https://example.com']) // true
 * isSafeRedirectUrl('https://example.com/path', ['https://example.com']) // false
 *
 * @example
 * // With allowed paths
 * isSafeRedirectUrl('https://example.com/api/callback', ['https://example.com'], ['/api/callback']) // true
 *
 * @example
 * // With trailing slashes (ignored)
 * isSafeRedirectUrl('https://example.com/', ['https://example.com']) // true
 */
export function isSafeRedirectUrl(
  url: string,
  allowedOrigins: Array<string | RegExp>,
  allowedPaths: string[] = []
): boolean {
  try {
    const parsedUrl = new URL(url)

    // Check if origin is in allowed list
    const isOriginAllowed = allowedOrigins.some((allowedOrigin) => {
      if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(parsedUrl.origin)
      }
      // Normalize allowed origin too
      const allowedOriginUrl = new URL(allowedOrigin)
      return allowedOriginUrl.origin === parsedUrl.origin
    })

    if (!isOriginAllowed) {
      return false
    }

    // If no allowed paths specified, only allow base URLs (no path or just /)
    if (allowedPaths.length === 0) {
      return parsedUrl.pathname === '/' || parsedUrl.pathname === ''
    }

    // Check if path is allowed (normalize by removing trailing slash)
    const normalizedPathname = parsedUrl.pathname.replace(/\/$/, '') || '/'
    return allowedPaths.includes(normalizedPathname)
  } catch {
    return false
  }
}
