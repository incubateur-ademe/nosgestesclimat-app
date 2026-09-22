/**
 * Sentry project of the app. Public by design (it ships in the browser
 * bundle): one env var per runtime, same project. `NEXT_PUBLIC_SENTRY_DSN`
 * is inlined at build for the browser, `SENTRY_DSN` is read at runtime by
 * the server and the worker. Unset in local dev: the SDK stays disabled.
 */
export const SENTRY_DSN =
  process.env.NEXT_PUBLIC_SENTRY_DSN ?? process.env.SENTRY_DSN
