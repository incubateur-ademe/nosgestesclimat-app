import { isServerSide } from '@/utils/nextjs/isServerSide'
import {
  captureException as captureSentryException,
  captureMessage as captureSentryMessage,
} from '@sentry/nextjs'
import posthog from 'posthog-js'

export const captureErrorForSentryAndPosthog = (error: unknown): void => {
  captureSentryException(error)

  // PostHog (posthog-js) is a browser-only SDK and client components are also
  // pre-rendered on the server (SSR): only forward to PostHog in the browser.
  if (isServerSide()) {
    return
  }

  posthog.captureException(error)
}

export const captureMessageForSentryAndPosthog = (message: string): void => {
  captureSentryMessage(message)

  // PostHog (posthog-js) is a browser-only SDK and client components are also
  // pre-rendered on the server (SSR): only forward to PostHog in the browser.
  if (isServerSide()) {
    return
  }

  posthog.captureException(new Error(message))
}
