import { FF_PARAM_PREFIX } from './constants'
import { FLAGS } from './flags'

/**
 * Extracts feature flag overrides from URL search parameters.
 *
 * Recognises params with the `FF_PARAM_PREFIX` prefix (e.g. `?ff_actions-v2=true`).
 * Values `true` / `false` are parsed as booleans; any other non-empty value is kept as a string.
 * Returns `null` when no valid overrides are present.
 */
export function parseFeatureFlagParams(
  searchParams: URLSearchParams
): Record<string, string | boolean> | null {
  const overrides: Record<string, string | boolean> = {}
  for (const [key, value] of searchParams.entries()) {
    if (!key.startsWith(FF_PARAM_PREFIX)) continue
    const flagName = key.slice(FF_PARAM_PREFIX.length)
    if (!(flagName in FLAGS)) continue
    const def = FLAGS[flagName as keyof typeof FLAGS]
    if (def.kind === 'boolean') {
      if (value === 'true') overrides[flagName] = true
      else if (value === 'false') overrides[flagName] = false
    } else {
      const variants: readonly string[] = (
        def as unknown as { variants: readonly string[] }
      ).variants
      if (variants.includes(value)) {
        overrides[flagName] = value
      }
    }
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
 * Parses the raw feature flag cookie value into an overrides map.
 * Returns an empty record for malformed, missing, or non-object input.
 */
export function parseFeatureFlagCookie(
  raw: string | undefined
): Record<string, string | boolean> {
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
