import * as Sentry from '@sentry/node'

// The worker runs these TypeScript sources directly, without a bundler: every
// module of the chain it reaches imports its siblings with an explicit `.ts`
// extension.
import { APP_ENV } from '../config/app-env.ts'
import { SENTRY_DSN } from '../config/sentry.ts'
import {
  initObservability,
  shutdownObservability,
} from '../src/observability/setup.ts'

Sentry.init({
  dsn: SENTRY_DSN,
  environment: APP_ENV,
  sampleRate: 1,
  // Traces live in PostHog, and this process reads them from the provider
  // registered below: Sentry must not install one of its own.
  skipOpenTelemetrySetup: true,
  tracesSampleRate: 0,
})

// Registered before the core services are imported — which is before Prisma is
// instantiated: that is what lets the queries be traced.
initObservability('worker')

export const captureException = Sentry.captureException

/** Sends what is buffered and stops both SDKs. Called before the process ends. */
export async function flushObservability(): Promise<void> {
  await Promise.allSettled([shutdownObservability(), Sentry.flush(2_000)])
}
