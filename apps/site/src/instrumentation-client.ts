import * as Sentry from '@sentry/nextjs'
import { APP_ENV } from '../config/app-env'
import { SENTRY_DSN } from '../config/sentry'
import { PostHog } from './services/tracking/Posthog'

Sentry.init({
  dsn: SENTRY_DSN,
  environment: APP_ENV,
  // Same release as `service.version`: one string to join spans, lines and
  // issues. Inlined at build time — the browser cannot read `SOURCE_VERSION`.
  release: process.env.NEXT_PUBLIC_APP_VERSION,
  sampleRate: 1,
  beforeSend(event, hint) {
    // Always send Server Component errors — they carry a digest
    // for server-side log correlation but lose their stack trace
    const error = hint.originalException
    if (error && typeof error === 'object' && 'digest' in error) {
      return event
    }
    return Math.random() < 0.1 ? event : null
  },
  enabled: process.env.NODE_ENV !== 'development',
})

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart

new PostHog().init()
