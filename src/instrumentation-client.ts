import * as Sentry from '@sentry/nextjs'
import { APP_ENV } from '../config/app-env'
import { PostHog } from './services/tracking/Posthog'

Sentry.init({
  dsn: 'https://75dcf9dfe74c4439977a517be2805122@sentry.incubateur.net/118',
  environment: APP_ENV,
  sampleRate: APP_ENV === 'production' ? 0.1 : 1,
  enabled: process.env.NODE_ENV !== 'development',
})

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart

new PostHog().init()
