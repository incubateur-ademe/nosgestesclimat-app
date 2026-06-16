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

// * matches any path characters including /
function pathToRegex(path: string): string {
  return path.split('*').map(escapeRegex).join('.*')
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

function wildcardPatternToRegex(pattern: string): RegExp {
  const { protocol, host, path } = parseUrlPattern(pattern)
  return new RegExp(`^${protocol}${hostToRegex(host)}${pathToRegex(path)}$`)
}

export function isSafeRedirectUrl(url: string, validUrls: string[]): boolean {
  try {
    const parsedUrl = new URL(url)
    const normalized = `${parsedUrl.protocol}//${parsedUrl.host}${parsedUrl.pathname}`
    return validUrls.some((pattern) => {
      try {
        return wildcardPatternToRegex(pattern).test(normalized)
      } catch {
        return false
      }
    })
  } catch {
    return false
  }
}
