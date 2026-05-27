/**
 * Detects Safari versions older than 17 from a User-Agent string.
 *
 * Safari < 17 does not support CHIPS (partitioned cookies) and may reject
 * cookies with the `Partitioned` attribute. It also has stricter
 * third-party cookie policies.
 *
 * Chrome and Chromium-based browsers include "Safari" in their UA string
 * (for historical reasons), so we must exclude them.
 */
export function isLegacySafariUA(userAgent: string | null): boolean {
  if (!userAgent) return false

  // Must be Safari, not Chrome/Chromium
  if (!/Safari/.test(userAgent) || /Chrome|Chromium/.test(userAgent)) {
    return false
  }

  // Extract Safari version from "Version/X.Y" in UA
  const match = userAgent.match(/Version\/(\d+)/)
  if (!match) return false

  const version = parseInt(match[1], 10)
  return version < 17
}
