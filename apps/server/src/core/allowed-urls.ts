function matchUrlToPatterns(url: string, patterns: URLPattern[]): boolean {
  try {
    new URL(url)
  } catch {
    return false
  }
  return patterns.some((pattern) => {
    try {
      return pattern.test(url)
    } catch {
      return false
    }
  })
}

export const isSafeRedirectUrl = matchUrlToPatterns
export const isAllowedOrigin = matchUrlToPatterns
