import type { OtelAttributes } from '@nosgestesclimat/core/features/logger/index'
import { toError } from '@nosgestesclimat/core/lib/to-error'
import * as Sentry from '@sentry/nextjs'
import type { Instrumentation } from 'next'

import logger from '@/logger.server'
import { initObservability, shutdownObservability } from '@/observability/setup'

export async function register() {
  if (process.env.NODE_ENV === 'development') {
    return
  }

  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Before anything instrumented is imported: this provider is the one
    // Sentry and pino read their trace context from.
    initObservability('site')
    await import('../sentry.server.config')
    const { posthogClient } = await import('@/services/tracking/posthogServer')

    async function shutdown() {
      try {
        // Ships what the batch processors hold, then returns: Next's own SIGTERM
        // handler drains the server and terminates the process, and exiting here
        // would cut it off mid-drain. The flush runs alongside the drain — it
        // does not need to have finished for the shutdown to be safe, only the
        // exporters need to be done enqueueing, which `shutdown` guarantees.
        await shutdownObservability()
        await posthogClient.shutdown()
      } catch (error) {
        logger.error(toError(error))
      }
    }

    /**
     * A process that survived an unknown failure keeps serving, from an
     * unknown state: it dies instead, and the orchestrator restarts a sane
     * one. `flush` gives the pending events a chance to leave before that.
     */
    async function crash(error: Error) {
      logger.fatal(error)
      await Promise.allSettled([Sentry.flush(2_000), shutdownObservability()])
      process.exit(1)
    }

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    process.on('SIGINT', shutdown)
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    process.on('SIGTERM', shutdown)
    // Next holds its own SIGINT/SIGTERM handlers (start-server): they drain the
    // server and exit, so the process still terminates — we only flush on the
    // side.

    process.on('uncaughtException', (error) => void crash(error))
    process.on('unhandledRejection', (reason) => void crash(toError(reason)))
  }
}

/**
 * Net for the errors no boundary controlled (Server Components, Server
 * Actions, Proxy). The line carries the request context the logs need, and
 * `captureRequestError` reports the same error to Sentry with its own
 * request metadata: reporting it here too would send the event twice.
 *
 * The HTTP attributes use the names the semantic conventions define today —
 * the ones the nginx logs already carry in PostHog, so a filter spans both —
 * and Next's own vocabulary stays under its `next.*` namespace.
 */
export const onRequestError: Instrumentation.onRequestError = (
  error,
  request,
  context
) => {
  logger.error(
    toError(error),
    {
      scope: 'site.instrumentation.onRequestError',
      ...({
        'http.request.method': request.method,
        'url.path': request.path,
        'http.route': context.routePath,
        'next.route_type': context.routeType,
      } satisfies Pick<
        OtelAttributes,
        'http.request.method' | 'url.path' | 'http.route' | `next.${string}`
      >),
    },
    { capture: false }
  )

  Sentry.captureRequestError(error, request, context)
}
