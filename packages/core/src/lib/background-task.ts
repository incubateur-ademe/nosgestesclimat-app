/**
 * Schedules work that must not block the response.
 *
 * Runtimes tearing down the execution context as soon as the response is sent
 * (a Next.js server action redirecting, a serverless handler...) must inject
 * their own primitive - `after` from `next/server`, `waitUntil`... - so the
 * task keeps running outside of the request lifecycle.
 */
export type RunInBackground = (task: () => Promise<void>) => void
