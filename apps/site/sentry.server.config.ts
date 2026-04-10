// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'
import { APP_ENV } from './config/app-env'

Sentry.init({
  dsn: 'https://75dcf9dfe74c4439977a517be2805122@sentry.incubateur.net/118',
  environment: APP_ENV,
  sampleRate: APP_ENV === 'production' ? 0.1 : 1,
  tracesSampleRate: 0.005,
})
