// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import { APP_ENV } from '@/env/app-env'
import { env } from '@/env/server'
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: env.SENTRY_DSN,
  environment: APP_ENV,
  sampleRate: 1,
  // Traces live in PostHog (`src/observability/setup.ts`): Sentry reports
  // errors only and reads the trace context from that provider instead of
  // owning one, so an error event and its trace share a `trace_id`.
  skipOpenTelemetrySetup: true,
  tracesSampleRate: 0,
})
