import { FF_PARAM_PREFIX } from './constants'
import type { FeatureFlagName } from './flags'

/**
 * Extracts feature flag overrides from URL search parameters.
 *
 * Recognises params with the `FF_PARAM_PREFIX` prefix (e.g. `?ff_actions-v2=true`).
 * Returns `null` when no valid overrides are present.
 *
 * @example `?ff_actions-v2=true&ff_new-feature=false` → `{ 'actions-v2': true, 'new-feature': false }`
 */
export function parseFeatureFlagParams(
  searchParams: URLSearchParams
): Record<string, boolean> | null {
  const overrides: Record<string, boolean> = {}
  for (const [key, value] of searchParams.entries()) {
    if (!key.startsWith(FF_PARAM_PREFIX)) continue
    const flagName = key.slice(FF_PARAM_PREFIX.length)
    if (value === 'true') overrides[flagName] = true
    else if (value === 'false') overrides[flagName] = false
  }
  return Object.keys(overrides).length > 0 ? overrides : null
}

/**
 * Returns a copy of the given URL with all feature flag query params removed.
 */
export function stripFeatureFlagParams(url: URL): URL {
  const cleaned = new URL(url)
  for (const key of [...cleaned.searchParams.keys()]) {
    if (key.startsWith(FF_PARAM_PREFIX)) cleaned.searchParams.delete(key)
  }
  return cleaned
}

/**
 * Parses the raw feature flag cookie value into a typed overrides map.
 * Returns an empty record for malformed, missing, or non-object input.
 */
export function parseFeatureFlagCookie(
  raw: string | undefined
): Partial<Record<FeatureFlagName, boolean>> {
  if (!raw) return {}
  try {
    const parsed = JSON.parse(raw)
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      return {}
    }
    return parsed
  } catch {
    return {}
  }
}
