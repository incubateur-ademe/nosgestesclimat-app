/**
 * The prefix our own attributes carry. Semantic conventions reserve the
 * unprefixed names, and a generic word (`code`, `job`, `count`) is what they
 * tell application developers to avoid: someone else will claim it.
 */
const PREFIX = 'ngc.'

/** Namespaces another party owns (kept as-is on the wire). Listed here so
 * query engines find `process.memory.usage`, not our version. */
const FOREIGN_PREFIXES = [
  'exception.',
  'http.',
  'next.',
  'process.',
  'url.',
  'v8js.',
]

/** Exact names another party owns, or a library put on the line. */
const FOREIGN_NAMES = [
  'error.type',
  // Pino's own base field.
  'service',
]

/**
 * The two names PostHog matches to link telemetry to a person and to a session
 * recording, on a log record as on a span. Its names, its business: the map
 * lives here so the bridge and the span processor write the same strings.
 */
export const POSTHOG_IDENTITY_ATTRIBUTES = {
  distinctId: 'posthogDistinctId',
  sessionId: 'sessionId',
} as const

FOREIGN_NAMES.push(
  POSTHOG_IDENTITY_ATTRIBUTES.distinctId,
  POSTHOG_IDENTITY_ATTRIBUTES.sessionId
)

/**
 * The name an attribute takes on the wire, from the short key a caller writes:
 * `job` → `ngc.job`. Keys already prefixed, and the ones another party owns,
 * are left alone.
 */
export function toAttributeKey(key: string): string {
  if (
    key.startsWith(PREFIX) ||
    FOREIGN_NAMES.includes(key) ||
    FOREIGN_PREFIXES.some((prefix) => key.startsWith(prefix))
  ) {
    return key
  }

  return `${PREFIX}${key}`
}
