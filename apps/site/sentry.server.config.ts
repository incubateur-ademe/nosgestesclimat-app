// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'
import { APP_ENV } from './config/app-env'
import { SENTRY_DSN } from './config/sentry'

Sentry.init({
  dsn: SENTRY_DSN,
  environment: APP_ENV,
  sampleRate: 1,
  // Traces live in PostHog (`src/observability/setup.ts`, NGC-3817): Sentry
  // reports errors only, and reads the trace context off that provider instead
  // of owning one — an error event and its trace then share a `trace_id`.
  skipOpenTelemetrySetup: true,
  tracesSampleRate: 0,
})
