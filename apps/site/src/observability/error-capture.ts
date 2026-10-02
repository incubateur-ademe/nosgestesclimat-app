import type { LogMeta } from '@nosgestesclimat/core/features/logger/index'
import { context, isSpanContextValid, trace } from '@opentelemetry/api'

import { posthogClient } from '../services/tracking/posthogServer.ts'
import { currentRequestIdentity } from './request-identity.ts'

/**
 * The PostHog half of the server-side capture: the same errors Sentry gets,
 * filed under the person the request was identified as, when it was, and
 * carrying the line they were reported with.
 *
 * The identity comes from the request's trace, which is what the log bridge
 * reads too — an error reported by a request and the lines of that request land
 * on the same person. `$session_id` rides along for the same reason: PostHog
 * links an event to the session replay it happened on through that property,
 * the browser SDK sets it on its own and a server process has to be told. It is
 * also what shows the issues of a session to a reader of a log entry.
 *
 * The span ids come from the active span, in the hexadecimal form the app
 * displays. Nothing links on them yet — the log record carries them in its own
 * fields — but they are the trace context Sentry attaches on its side, and a
 * HogQL join reaches the spans through them (`base64Encode(unhex(trace_id))`).
 *
 * `captureException` queues and returns: nothing here waits for the network,
 * and the flushes already in place (shutdown on SIGTERM, the fatal path before
 * the exit) carry what is buffered.
 */
export function captureToPostHog(error: Error, line?: LogMeta): void {
  const identity = currentRequestIdentity()
  const spanContext = trace.getSpan(context.active())?.spanContext()

  const properties = {
    ...(line ?? {}),
    ...(spanContext && isSpanContextValid(spanContext)
      ? { trace_id: spanContext.traceId, span_id: spanContext.spanId }
      : {}),
    ...(identity?.sessionId ? { $session_id: identity.sessionId } : {}),
  }

  posthogClient.captureException(error, identity?.distinctId, properties)
}
