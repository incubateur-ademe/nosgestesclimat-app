import { toError } from '@nosgestesclimat/core/lib/to-error'
import * as Sentry from '@sentry/nextjs'
import type { Instrumentation } from 'next'

import logger from '@/logger.server'

export async function register() {
  if (process.env.NODE_ENV === 'development') {
    return
  }

  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('../sentry.server.config')
    const { posthogClient } = await import('@/services/tracking/posthogServer')

    async function shutdown() {
      try {
        await posthogClient.shutdown()
        process.exit(0)
      } catch (error) {
        logger.error(toError(error))
        process.exit(1)
      }
    }

    /**
     * A process that survived an unknown failure keeps serving, from an
     * unknown state: it dies instead, and the orchestrator restarts a sane
     * one. `flush` gives the pending events a chance to leave before that.
     */
    async function crash(error: Error) {
      logger.fatal(error)
      await Sentry.flush(2_000)
      process.exit(1)
    }

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    process.on('SIGINT', shutdown)
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    process.on('SIGTERM', shutdown)

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
      component: 'site.instrumentation.onRequestError',
      'http.request.method': request.method,
      'url.path': request.path,
      'http.route': context.routePath,
      'next.route_type': context.routeType,
    },
    { capture: false }
  )

  Sentry.captureRequestError(error, request, context)
}
