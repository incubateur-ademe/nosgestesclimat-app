import type { LogMeta } from '@nosgestesclimat/core/features/logger/index'
import * as Sentry from '@sentry/node'

import { APP_ENV } from '../env/app-env.ts'
import { env } from '../env/server.ts'
import { captureToPostHog } from './error-capture.ts'
import { initObservability, shutdownObservability } from './setup.ts'

// Replaced at build by `scripts/inline-source-version.mjs` with the deployed
// commit: the value Next inlines for the web never reaches these processes.
const version = '__SOURCE_VERSION__'

/**
 * Wires Sentry and the OTLP exports for a process that is not the Next server.
 * The runtime name is the only thing they do not share — `service.name` says
 * the process, and each one must be findable on its own.
 */
export function initProcessObservability(service: string): void {
  Sentry.init({
    dsn: env.NEXT_PUBLIC_SENTRY_DSN,
    environment: APP_ENV,
    sampleRate: 1,
    // Traces live in PostHog, and this process reads them from the provider
    // registered below: Sentry must not install one of its own.
    skipOpenTelemetrySetup: true,
    tracesSampleRate: 0,
  })

  // No token or no endpoint: nothing to export, so nothing to instrument.
  const token = env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN
  const endpoint = env.POSTHOG_OTLP_ENDPOINT
  if (token && endpoint) {
    initObservability(service, version, { token, endpoint })
  }
}

export const captureException = (error: Error, line: LogMeta): void => {
  Sentry.captureException(error, { extra: line })
  captureToPostHog(error, line)
}

/** Sends what is buffered and stops both SDKs. Awaited before the process
 * ends. */
export async function flushObservability(): Promise<void> {
  await Promise.allSettled([shutdownObservability(), Sentry.flush(2_000)])
}
