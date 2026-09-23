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
const FOREIGN_KEYS = [
  // Semantic conventions.
  'error.type',
  'exception.',
  'http.',
  'next.',
  'process.',
  'url.',
  'v8js.',
  // PostHog matches on these two: its names, its business.
  'posthogDistinctId',
  'sessionId',
  // Pino's own base field, kept on the line; the resource carries the service.
  'service',
]

/**
 * The name an attribute takes on the wire, from the short key a caller writes:
 * `component` → `ngc.component`. Keys already prefixed, and the ones another
 * party owns, are left alone.
 */
export function toAttributeKey(key: string): string {
  if (key.startsWith(PREFIX) || FOREIGN_KEYS.some((k) => key.startsWith(k))) {
    return key
  }

  return `${PREFIX}${key}`
}
