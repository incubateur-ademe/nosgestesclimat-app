const ONE_MINUTE_IN_SECONDS = 60

/**
 * `cacheLife` profiles, in seconds, for the timespans Next.js does not cover:
 * its shortest built-in profile, `minutes`, revalidates after 60s, which is
 * shorter than we need.
 */
export const CACHE_PROFILES = {
  FIVE_MINUTES: {
    stale: 5 * ONE_MINUTE_IN_SECONDS,
    revalidate: 5 * ONE_MINUTE_IN_SECONDS,
    expire: 15 * ONE_MINUTE_IN_SECONDS,
  },
} as const
