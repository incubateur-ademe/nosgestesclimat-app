import { createHash } from 'node:crypto'

/** hashed request key -> timestamp at which its rate limit expires */
const rateLimitedRequests = new Map<string, number>()

/** timestamp of the last expired-entry sweep */
let lastSweepAt = 0

const hashKey = (key: string) => createHash('sha256').update(key).digest('hex')

/**
 * In-memory rate limiter for the server actions.
 *
 * Limitations: the state is held in the Node.js process only — it resets on
 * every deploy and is not shared across instances, so the limit is
 * per-process and weaker than a Redis-backed limiter.
 */
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

  // Lazy TTL sweep, run at most once per TTL window (expiry is still checked
  // on every read, so skipping the sweep never changes the verdict): each
  // call stays amortised O(1) instead of paying an O(n) sweep, and the map
  // only holds keys seen within their TTL window.
  if (now - lastSweepAt >= ttlMs) {
    lastSweepAt = now
    for (const [storedKey, expiresAt] of rateLimitedRequests) {
      if (expiresAt <= now) {
        rateLimitedRequests.delete(storedKey)
      }
    }
  }

  if ((rateLimitedRequests.get(requestKey) ?? 0) > now) {
    return false
  }

  rateLimitedRequests.set(requestKey, now + ttlMs)

  return true
}
