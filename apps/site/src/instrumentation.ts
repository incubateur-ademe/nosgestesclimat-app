import type { OtelAttributes } from '@nosgestesclimat/core/features/logger/index'
import { toError } from '@nosgestesclimat/core/lib/to-error'
import * as Sentry from '@sentry/nextjs'
import type { Instrumentation } from 'next'

export async function register() {
  if (process.env.NODE_ENV === 'development') {
    return
  }

  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Everything Node-only is imported here rather than at the top: this module
    // is also compiled for the edge runtime, and pino, the OTel SDK and
    // `node:crypto` have no edge build — a static import would ship them there.
    const { env } = await import('@/env/server')
    const { initObservability, shutdownObservability } =
      await import('@/observability/setup')
    const { default: logger } = await import('@/logger/logger.server')

    // Validates the server environment — the file throws on a missing or
    // malformed variable — and hands the observability settings over: this
    // provider is the one Sentry and pino read their trace context from, so it
    // must be registered before anything instrumented is imported.
    const {
      NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN: token,
      POSTHOG_OTLP_ENDPOINT: endpoint,
      SOURCE_VERSION: version,
    } = env
    // No token or no endpoint: nothing to export, so nothing to instrument.
    if (token && endpoint) {
      initObservability('web-server', version, { token, endpoint })
    }
    await import('../sentry.server.config')
    const { posthogClient } = await import('@/services/tracking/posthogServer')

    async function shutdown() {
      try {
        // Flushes what the batch processors hold and returns: Next's own
        // SIGTERM handler drains the server and terminates the process, so
        // exiting here would cut the drain short. The flush only has to finish
        // enqueueing before that, which `shutdown` guarantees.
        await shutdownObservability()
        await posthogClient.shutdown()
      } catch (error) {
        logger.error(toError(error))
      }
    }

    /**
     * A process that survived an unknown failure keeps serving from an unknown
     * state: it dies instead, and the orchestrator restarts a sane one. The
     * flush gives the pending events a chance to leave before that.
     */
    async function crash(error: Error) {
      logger.fatal(error)
      await Promise.allSettled([
        Sentry.flush(2_000),
        shutdownObservability(),
        // `fatal` queued the exception to PostHog just above: without this
        // flush, the crash — the one failure nobody gets to retry — is the one
        // PostHog never sees.
        posthogClient.shutdown(),
      ])
      process.exit(1)
    }

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    process.on('SIGINT', shutdown)
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    process.on('SIGTERM', shutdown)
    // Next holds its own SIGINT/SIGTERM handlers (`start-server`): they drain
    // the server and exit, so the process still terminates — we only flush
    // alongside.

    process.on('uncaughtException', (error) => void crash(error))
    process.on('unhandledRejection', (reason) => void crash(toError(reason)))
  }
}

/**
 * Net for the errors no boundary controlled: Server Components, Server Actions,
 * the proxy. The line carries the request context a reader needs, and the
 * capture follows the level: both sinks get the error with those same
 * attributes, so an issue names the route it came from. Sentry's own
 * `captureRequestError` would file the same error a second time, which is why
 * the logger is the only capture path on Node.
 *
 * The HTTP attributes use the names the semantic conventions define today, the
 * ones the nginx logs already carry in PostHog, so one filter spans both.
 * Next's own vocabulary stays under its `next.*` namespace.
 */
export const onRequestError: Instrumentation.onRequestError = async (
  error,
  request,
  context
) => {
  // The logger is Node-only (pino), so this hook returns in any other runtime
  // rather than fail to import it. Next 16 runs `proxy.ts` on Node and nothing
  // here declares `runtime: 'edge'`: no error reaches this branch today, and it
  // keeps the hook from throwing if one ever does.
  if (process.env.NEXT_RUNTIME !== 'nodejs') {
    return
  }

  const { default: logger } = await import('@/logger/logger.server')
  const failure = toError(error)

  logger.error(failure, {
    scope: 'site.instrumentation.onRequestError',
    ...({
      'http.request.method': request.method,
      'url.path': request.path,
      'http.route': context.routePath,
      'next.route_type': context.routeType,
    } satisfies Partial<OtelAttributes>),
  })
  // The line says why; so does the span, because a reader who lands on the
  // trace (from the trace list, from a slow request) has no reason to know a
  // line exists. Attributes rather than `recordException` alone: PostHog
  // ingests span attributes and drops events. The status stays Next's own
  // call — an error an error boundary renders is not a failed request.
  const { trace } = await import('@opentelemetry/api')
  const { exceptionAttributes } = await import('@/logger/line')
  const { toSpanAttributes } = await import('@/observability/otlp-attributes')

  trace
    .getActiveSpan()
    ?.setAttributes(toSpanAttributes(exceptionAttributes(failure)))
}
