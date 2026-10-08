import type { LogMeta } from '@nosgestesclimat/core/features/logger/index'
import { context, isSpanContextValid, trace } from '@opentelemetry/api'

import { posthogClient } from '../services/tracking/posthogServer.ts'
import { currentRequestIdentity } from './request-identity.ts'

/**
 * The PostHog half of the server-side capture: the same errors Sentry gets,
 * filed under the person the request was identified as, and carrying the line
 * they were reported with.
 */
export function captureToPostHog(error: Error, line?: LogMeta): void {
  // The request's trace, which is what the log bridge reads too: an error
  // reported by a request and the lines of that request land on the same
  // person.
  const identity = currentRequestIdentity()
  const spanContext = trace.getSpan(context.active())?.spanContext()

  const properties = {
    ...(line ?? {}),
    ...(spanContext && isSpanContextValid(spanContext)
      ? { trace_id: spanContext.traceId, span_id: spanContext.spanId }
      : {}),
    // What links the event to the session replay it happened on: the browser
    // SDK sets it on its own, a server process has to be told.
    ...(identity?.sessionId ? { $session_id: identity.sessionId } : {}),
  }

  // `captureException` queues and returns: nothing here waits for the network
  posthogClient.captureException(error, identity?.distinctId, properties)
}
