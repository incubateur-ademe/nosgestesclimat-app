import * as Sentry from '@sentry/nextjs'
import { APP_ENV } from '../config/app-env'
import { PostHog } from './services/tracking/Posthog'

Sentry.init({
  dsn: 'https://75dcf9dfe74c4439977a517be2805122@sentry.incubateur.net/118',
  environment: APP_ENV,
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
