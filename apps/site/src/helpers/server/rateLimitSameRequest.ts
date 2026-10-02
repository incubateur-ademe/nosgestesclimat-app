import { createHash } from 'node:crypto'

import { redis } from '@/adapters/redis/client'
import { RateLimitedError } from '@/components/authentication/errors'
import logger from '@/logger'
import { failure, success, type Result } from '@nosgestesclimat/core/lib/result'

/**
 * Redis-backed rate limiter for the server actions: one call per key and TTL
 * window, shared across instances (unlike the previous in-memory Map, which
 * was per-process and reset on every deploy).
 */
export const rateLimitSameRequest = async ({
  key,
  ttlInSeconds = 30,
}: {
  /** e.g. `login:${email}` — hashed before being stored in Redis. */
  key: string
  ttlInSeconds?: number
}): Promise<Result<{ degraded: boolean }, RateLimitedError>> => {
  // The raw key contains the user's email: hashing keeps it out of Redis,
  // where anyone with CLI access could read it.
  const requestHash = hashKey(key)
  const redisKey = `${RATE_LIMIT_SAME_REQUESTS_KEY}_${requestHash}`

  try {
    // A single atomic command, so two concurrent requests for the same key
    // can never both land inside the same window:
    // - `NX` writes only if the key does not exist yet: exactly one request
    //   per window receives 'OK', every other one receives null.
    // - `EX` makes Redis delete the key once the TTL has passed, which is
    //   what closes the current window and opens the next one — no sweeping
    //   needed, unlike the previous in-memory implementation.
    const result = await redis.set(
      redisKey,
      requestHash,
      'EX',
      ttlInSeconds,
      'NX'
    )

    if (result !== 'OK') {
      // The key already exists: the same request was seen less than
      // ttlInSeconds ago.
      return failure(new RateLimitedError())
    }

    // We won the SET: first request for this key in the window.
    return success({ degraded: false })
  } catch (error) {
    // Fail-open like the previous server implementation: availability of the
    // action wins over throttling when Redis is down. The limiter is the only
    // place that warns, so no caller has to repeat it.
    logger.warn('Could not rate limit same requests', { error })

    return success({ degraded: true })
  }
}

const RATE_LIMIT_SAME_REQUESTS_KEY = 'rateLimitSameRequests'

const hashKey = (key: string) => createHash('sha256').update(key).digest('hex')
