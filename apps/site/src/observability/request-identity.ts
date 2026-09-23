import { trace, type Span } from '@opentelemetry/api'
import type { ReadableSpan, SpanProcessor } from '@opentelemetry/sdk-trace-base'

import { POSTHOG_IDENTITY_ATTRIBUTES } from '@nosgestesclimat/core/features/logger/attribute-key'

export interface RequestIdentity {
  /** PostHog `distinct_id`: an authenticated user's id, or the one posthog-js sent. */
  distinctId?: string
  /** PostHog session, the one a session recording is filed under. */
  sessionId?: string
}

/**
 * The identity of the requests in flight, keyed by trace id.
 *
 * Not an async-local store: the session comes from the headers, so
 * `identifyRequest` always runs after an `await`, and a store entered after an
 * `await` stays in that continuation — measured, it does not survive the
 * caller's `await`, so it would reach no other frame of the request. The trace
 * is the request (nginx's request id is our root), so a consumer finds the
 * identity from the span it is already handling: the log bridge from the active
 * span, the span processor from the span it decorates.
 *
 * OTel baggage would be the by-the-book carrier, and has the same problem: it
 * can only be set around the work (`context.with`), which means wrapping every
 * action body — and it would travel to other services in outgoing headers.
 */
const identities = new Map<string, { identity: RequestIdentity; at: number }>()

/** A request lives seconds. The sweep is throttled: it is a leak stopper, not a
 * clock — a stale entry is unreachable anyway, 128 random bits never repeat. */
const IDENTITY_MAX_AGE_MS = 5 * 60 * 1000
const SWEEP_INTERVAL_MS = 60 * 1000

let lastSweep = 0

/**
 * Attributes the request to its user and PostHog session. The lines emitted
 * after it, and the spans ended after it, reuse it.
 *
 * Called inside the span of the operation that read the session: that is the
 * span whose trace id the identity is filed under.
 */
export function identifyRequest(identity: RequestIdentity): void {
  if (!identity.distinctId && !identity.sessionId) {
    return
  }

  const traceId = trace.getActiveSpan()?.spanContext().traceId

  if (!traceId) {
    return
  }

  sweepIdentities()
  identities.set(traceId, { identity, at: Date.now() })
}

/** The identity of the request this trace belongs to, if it has been read. */
export function identityForTrace(
  traceId: string | undefined
): RequestIdentity | undefined {
  return traceId ? identities.get(traceId)?.identity : undefined
}

/** The identity of the request being served, if it has been read yet. */
export function currentRequestIdentity(): RequestIdentity | undefined {
  return identityForTrace(trace.getActiveSpan()?.spanContext().traceId)
}

function sweepIdentities(): void {
  const now = Date.now()

  if (now - lastSweep < SWEEP_INTERVAL_MS) {
    return
  }

  lastSweep = now
  const oldest = now - IDENTITY_MAX_AGE_MS

  for (const [traceId, entry] of identities) {
    if (entry.at < oldest) {
      identities.delete(traceId)
    }
  }
}

/**
 * Stamps the request's identity on every span of the request: the database
 * queries and outgoing calls are then attributed like the request itself,
 * which is what makes "the slow queries of this user" answerable.
 *
 * `onEnding` alone covers the whole request. It runs for every recorded span,
 * right before the SDK freezes the attributes — `setAttribute` past `end()` is
 * ignored — so it also reaches the spans opened before the session was read,
 * the framework's request span above all, the one PostHog shows as the
 * request. A span never ended is never exported, so nothing is missed by not
 * hooking `onStart`.
 */
class IdentitySpanProcessor implements SpanProcessor {
  // Declared by the interface, flagged experimental by the SDK: the only hook
  // that can still write attributes on an ending span. `onStart` and `onEnd`
  // stay as no-ops: the SDK calls them unconditionnally.
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onStart(_span: Span): void {}

  onEnding(span: Span): void {
    // The span's own trace, not the active one: `end()` is called by whoever
    // holds the span, not necessarily inside it.
    stamp(span, identityForTrace(span.spanContext().traceId))
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onEnd(_span: ReadableSpan): void {}

  forceFlush(): Promise<void> {
    return Promise.resolve()
  }

  shutdown(): Promise<void> {
    return Promise.resolve()
  }
}

function stamp(span: Span, identity: RequestIdentity | undefined): void {
  if (!identity) {
    return
  }

  if (identity.distinctId) {
    span.setAttribute(
      POSTHOG_IDENTITY_ATTRIBUTES.distinctId,
      identity.distinctId
    )
  }
  if (identity.sessionId) {
    span.setAttribute(POSTHOG_IDENTITY_ATTRIBUTES.sessionId, identity.sessionId)
  }
}

export { IdentitySpanProcessor }
