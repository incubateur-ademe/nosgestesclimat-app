function patternToURLPattern(pattern: string): URLPattern {
  // Substitute * with a sentinel so new URL() can parse the pattern string,
  const SENTINEL = 'xwildcardx'
  const parsed = new URL(pattern.replaceAll('*', SENTINEL))

  return new URLPattern({
    // Remove `:` from URL protocol
    protocol: parsed.protocol.slice(0, -1),
    // Ensures `*` in hostname only validates one level of subdomain
    hostname: parsed.hostname.replaceAll(SENTINEL, ':_wildcard'),
    port: parsed.port,
    // Ensures that pattern without path do not match any path unless `/*` is explicit
    pathname: parsed.pathname.replaceAll(SENTINEL, '*'),
    search: '*',
    hash: '*',
  })
}

function matchUrlToPatterns(url: string, patterns: string[]): boolean {
  try {
    new URL(url)
  } catch {
    return false
  }
  return patterns.some((pattern) => {
    try {
      return patternToURLPattern(pattern).test(url)
    } catch {
      return false
    }
  })
}

export const isSafeRedirectUrl = matchUrlToPatterns
export const isAllowedOrigin = matchUrlToPatterns
