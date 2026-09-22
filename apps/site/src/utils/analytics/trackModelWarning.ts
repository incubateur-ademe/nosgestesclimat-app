import { isServerSide } from '@/utils/nextjs/isServerSide'

import { trackEvent } from './trackEvent'

/**
 * A warning about the shape of the model — a missing rule, a missing sum, a
 * situation that cannot be updated — is a diagnostic about the rules, not a
 * failure to fix. It goes to PostHog, where its rate is readable, and not to
 * Sentry as a capture that would carry no stack.
 */
export const trackModelWarning = (message: string): void => {
  // PostHog (posthog-js) is a browser-only SDK, and client components are also
  // pre-rendered on the server.
  if (isServerSide()) {
    return
  }

  trackEvent({ eventName: 'model warning', properties: { message } })
}
