/**
 * PII redaction helpers shared by the site and server loggers.
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
export const truncateUserId = (userId: unknown) =>
  typeof userId === 'string' ? `${userId.slice(0, 8)}***` : '[REDACTED]'
