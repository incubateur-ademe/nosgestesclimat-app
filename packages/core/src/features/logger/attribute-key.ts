/**
 * The prefix our own attributes carry. Semantic conventions reserve the
 * unprefixed names, and a generic word (`code`, `job`, `count`) is what they
 * explicitly tell application developers to avoid: someone else will claim it.
 */
const PREFIX = 'ngc.'

/**
 * Attributes another party named. They keep their exact spelling — a query
 * engine looks for `process.memory.usage`, not for our version of it — which
 * is why they are listed here instead of being guessed at call sites.
 */
/** Namespaces another party owns: everything under them keeps its spelling. */
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
 * recording — on a log record as on a span. Its names, its business: they are
 * exported with them, so they are listed here rather than guessed at call
 * sites.
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
 * `job` → `ngc.job`. Keys already prefixed, and the ones another
 * party owns, are left alone.
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
