/**
 * Keeps a log line correlatable with a user report without storing the address:
 * `jo***@ex***.com` is enough to match an email a user gives us in support.
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
  typeof userId === 'string'
    ? `${userId.slice(0, 8)}***`
    : '[REDACTED]'
