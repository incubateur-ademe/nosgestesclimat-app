const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

function parseUrlPattern(pattern: string) {
  const match = /^(https?:\/\/)([^/]+)(\/.*)?$/.exec(pattern)
  if (!match) throw new Error(`Invalid URL pattern: ${pattern}`)
  return { protocol: match[1], host: match[2], path: match[3] ?? '/' }
}

// * matches exactly one hostname label — never crosses a dot
function hostToRegex(host: string): string {
  return host.split('*').map(escapeRegex).join('[^.]+')
}

function patternToURLPattern(pattern: string): URLPattern {
  // Substitute * with a sentinel so new URL() can parse the pattern string,
  // then restore wildcards per component:
  //   hostname → :_wildcard  (named group: one DNS label, no dots — same as [^.]+)
  //   pathname → *           (any chars including /)
  // SENTINEL must be all-lowercase; URL normalises hostnames to lowercase.
  const SENTINEL = 'xwildcardx'
  const parsed = new URL(pattern.replaceAll('*', SENTINEL))
  return new URLPattern({
    protocol: parsed.protocol.slice(0, -1),
    hostname: parsed.hostname.replaceAll(SENTINEL, ':_wildcard'),
    port: parsed.port,
    pathname: parsed.pathname.replaceAll(SENTINEL, '*'),
    search: '*',
    hash: '*',
  })
}

/**
 * Converts wildcard URL patterns to origins compatible with the `cors` package.
 * Patterns without `*` become exact origin strings; patterns with `*` become RegExps.
 * The path portion is discarded — cors compares against the Origin request header.
 *
 * @example
 * wildcardUrlsToCorsOrigins(['https://example.com/', 'https://*.vercel.app/'])
 * // → ['https://example.com', /^https:\/\/[^.]+\.vercel\.app$/]
 */
export function wildcardUrlsToCorsOrigins(
  patterns: string[]
): Array<string | RegExp> {
  return patterns.map((pattern) => {
    const { protocol, host } = parseUrlPattern(pattern)
    if (!host.includes('*')) return `${protocol}${host}`
    return new RegExp(`^${protocol}${hostToRegex(host)}$`)
  })
}

export function isSafeRedirectUrl(url: string, validUrls: string[]): boolean {
  try {
    new URL(url)
  } catch {
    return false
  }
  return validUrls.some((pattern) => {
    try {
      return patternToURLPattern(pattern).test(url)
    } catch {
      return false
    }
  })
}
