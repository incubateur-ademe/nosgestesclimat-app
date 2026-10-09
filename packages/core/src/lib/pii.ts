/**
 * Keeps a log line correlatable with a user report without storing the
 * address: `jo***@ex***.com` is enough to match an email a user gives us
 * in support.
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
