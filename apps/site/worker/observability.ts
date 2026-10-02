import type { LogMeta } from '@nosgestesclimat/core/features/logger/index'
import * as Sentry from '@sentry/node'

// The worker runs these TypeScript sources directly, without a bundler: every
// module of the chain it reaches imports its siblings with an explicit `.ts`
// extension.
import { APP_ENV } from '../src/env/app-env.ts'
import {
  initObservability,
  shutdownObservability,
} from '../src/observability/setup.ts'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: APP_ENV,
  sampleRate: 1,
  // Traces live in PostHog, and this process reads them from the provider
  // registered below: Sentry must not install one of its own.
  skipOpenTelemetrySetup: true,
  tracesSampleRate: 0,
})

// Registered before the core services are imported, which is before Prisma is
// instantiated: that is what lets the queries be traced. The worker has no
// `env/server.ts` — that file is the site's contract, and it requires variables
// the worker never uses — so its export settings are read here, at its root.
// No token or no endpoint: nothing to export, so nothing to instrument.
const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN
const endpoint = process.env.POSTHOG_OTLP_ENDPOINT
const version = process.env.SOURCE_VERSION
if (token && endpoint) {
  initObservability('worker', version, { token, endpoint })
}

import { captureToPostHog } from '../src/observability/error-capture.ts'

export const captureException = (error: Error, line: LogMeta): void => {
  Sentry.captureException(error, { extra: line })
  captureToPostHog(error, line)
}

/** Sends what is buffered and stops both SDKs. Called before the process
 * ends. */
export async function flushObservability(): Promise<void> {
  await Promise.allSettled([shutdownObservability(), Sentry.flush(2_000)])
}
