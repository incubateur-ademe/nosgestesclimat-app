import { createHash } from 'node:crypto'

/**
 * In-memory rate limiter for the server actions.
 *
 * Limitations (accepted by the auth migration, decision 5): the state is
 * held in the Node.js process only — it resets on every deploy and is not
 * shared across instances, so the limit is per-process and weaker than a
 * Redis-backed limiter.
 */

/** hashed request key -> timestamp at which its rate limit expires */
const rateLimitedRequests = new Map<string, number>()

const hashKey = (key: string) => createHash('sha256').update(key).digest('hex')

export const rateLimitSameRequest = ({
  key,
  ttlMs = 30_000,
}: {
  /** e.g. `login:${email}` — hashed before being stored */
  key: string
  ttlMs?: number
}): boolean => {
  const now = Date.now()
  const requestKey = hashKey(key)

  // Lazy TTL sweep: expired entries are removed on read, so the map only
  // holds keys seen within their TTL window.
  for (const [storedKey, expiresAt] of rateLimitedRequests) {
    if (expiresAt <= now) {
      rateLimitedRequests.delete(storedKey)
    }
  }

  if ((rateLimitedRequests.get(requestKey) ?? 0) > now) {
    return false
  }

  rateLimitedRequests.set(requestKey, now + ttlMs)

  return true
}
