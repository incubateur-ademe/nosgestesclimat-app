import { isServerSide } from '@/utils/nextjs/isServerSide'
import { captureException as captureSentryException } from '@sentry/nextjs'
import posthog from 'posthog-js'

/**
 * Reports an exception caught in the browser, where the server logger cannot
 * see it. A failure that came back from a server action does not belong here:
 * the object has been serialized on the way (no prototype, no stack) and the
 * server already logged it.
 */
export const captureErrorForSentryAndPosthog = (error: unknown): void => {
  captureSentryException(error)

  // PostHog (posthog-js) is a browser-only SDK and client components are also
  // pre-rendered on the server (SSR): only forward to PostHog in the browser.
  if (isServerSide()) {
    return
  }

  posthog.captureException(error)
}
