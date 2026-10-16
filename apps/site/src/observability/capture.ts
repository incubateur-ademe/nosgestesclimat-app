import type { LogMeta } from '@nosgestesclimat/core/features/logger/index'
import * as Sentry from '@sentry/node'

import { APP_ENV } from '../env/app-env.ts'
import { posthogClient } from '../services/tracking/posthogServer.ts'
import { captureToPostHog } from './error-capture.ts'

/**
 * Where an error goes: an issue in Sentry, an event in PostHog. Reachable
 * without the environment, so that a process which cannot read it reports too.
 */
export function initErrorCapture({ dsn }: { dsn: string | undefined }): void {
  // A process that dies after its wiring runs this a second time: the first
  // client wins.
  if (Sentry.getClient()) return

  Sentry.init({
    dsn,
    environment: APP_ENV,
    sampleRate: 1,
    // Traces live in PostHog, and a process reads them from the provider its
    // observability wiring registers: Sentry must not install one of its own.
    skipOpenTelemetrySetup: true,
    tracesSampleRate: 0,
  })
}

export const captureException = (error: Error, line: LogMeta): void => {
  Sentry.captureException(error, { extra: line })
  captureToPostHog(error, line)
}

/** Sends what both reporters hold. For a process that is ending: the PostHog
 * client only queues its events, and this closes it. */
export async function flushErrorCapture(): Promise<void> {
  await Promise.allSettled([Sentry.flush(2_000), posthogClient.shutdown()])
}
