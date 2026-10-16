import type { LogMeta } from '@nosgestesclimat/core/features/logger/index'
import { toError } from '@nosgestesclimat/core/lib/to-error'
import * as Sentry from '@sentry/node'

import { APP_ENV } from '../env/app-env.ts'
import { readServerEnv } from '../env/server-contract.ts'
import { createLogger } from '../logger/logger.node.ts'
import { posthogClient } from '../services/tracking/posthogServer.ts'
import { captureToPostHog } from './error-capture.ts'
import { initOtel, shutdownOtel } from './otel.ts'

// Replaced at build by `scripts/inline-source-version.mjs` with the deployed
// commit: the value Next inlines for the web never reaches these processes.
const version = '__SOURCE_VERSION__'

/**
 * Wires a process that is not the Next server. Loaded as the `--import`ed root:
 * nothing here reads the environment at load, so the handler reports a contract
 * that cannot be read.
 */
export function wireProcessObservability(service: string) {
  // Handlers first, then the client they report with: both are in place before
  // the contract is read, which is what may fail.
  reportStartupFailures(service)
  initSentryClient(process.env.NEXT_PUBLIC_SENTRY_DSN)

  initProcessObservability(service)

  return { captureException, flushObservability }
}

/** An issue in Sentry, an event in PostHog. */
export function captureException(error: Error, line: LogMeta): void {
  Sentry.captureException(error, { extra: line })
  captureToPostHog(error, line)
}

/** Sends what the reporters hold and closes the PostHog client, which only
 * queues. A reporter that never started resolves on its own. */
export async function flushObservability(): Promise<void> {
  await Promise.allSettled([
    Sentry.flush(2_000),
    posthogClient.shutdown(),
    shutdownOtel(),
  ])
}

/** Covers a process that dies before its own wiring is up — a missing variable,
 * a module that cannot load — and one that survives a failure in a loop. */
function reportStartupFailures(service: string): void {
  // No verbosity, no `LOG_PRETTY`: the environment this would read is what may
  // have failed.
  const logger = createLogger({ service, onCapture: captureException })

  const report = async (error: Error) => {
    logger.fatal(error)

    await flushObservability()
    process.exit(1)
  }

  process.on('uncaughtException', (error) => void report(error))
  process.on('unhandledRejection', (reason) => void report(toError(reason)))
}

/** Reads the site's contract here rather than at module load: a variable it
 * rejects fails at startup, where the handler reports it. */
function initProcessObservability(service: string): void {
  const env = readServerEnv()

  // No token or no endpoint: nothing to export, so nothing to instrument.
  const token = env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN
  const endpoint = env.POSTHOG_OTLP_ENDPOINT
  if (token && endpoint) {
    initOtel(service, version, { token, endpoint })
  }
}

function initSentryClient(dsn: string | undefined): void {
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
