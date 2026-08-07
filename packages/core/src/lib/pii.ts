/**
 * PII redaction helpers shared by the site and server loggers.
 *
 * Naming convention: every helper that anonymises a value is prefixed with
 * `mask`, so callers can rely on the same verb regardless of the field.
 *
 * Both keep enough of a value to correlate a log line with a user report
 * without storing the full address or the session bearer itself.
 */
export const maskEmail = (email: unknown) => {
  if (typeof email !== 'string') {
    return '[REDACTED]'
  }

  const [local, domain] = email.split('@')

  return domain
    ? `${local.slice(0, 2)}***@${domain.slice(0, 2)}***`
    : '[REDACTED]'
}

/**
 * The session userId acts as a bearer for the anonymous data it points to, so
 * logs keep only a truncated prefix (enough to correlate) and never the value.
 */
export const maskUserId = (userId: unknown) =>
  typeof userId === 'string' ? `${userId.slice(0, 8)}***` : '[REDACTED]'
