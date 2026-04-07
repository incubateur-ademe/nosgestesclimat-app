import * as Sentry from '@sentry/nextjs'
import posthog from 'posthog-js'
import { APP_ENV } from '../config/app-env'

declare global {
  interface Window {
    posthog?: typeof posthog
  }
}

Sentry.init({
  dsn: 'https://75dcf9dfe74c4439977a517be2805122@sentry.incubateur.net/118',
  environment: APP_ENV,
  sampleRate: APP_ENV === 'production' ? 0.1 : 1,
  enabled: process.env.NODE_ENV !== 'development',
})

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart

// Expose posthog globally for inline scripts
if (typeof window !== 'undefined') {
  window.posthog = posthog
}
