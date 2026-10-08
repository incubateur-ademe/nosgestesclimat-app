import { trace, type Span } from '@opentelemetry/api'
import type { ReadableSpan, SpanProcessor } from '@opentelemetry/sdk-trace-base'

import { POSTHOG_IDENTITY_ATTRIBUTES } from '@nosgestesclimat/core/features/logger/attribute-key'

import { processStore } from './process-store.ts'

export interface RequestIdentity {
  /**
   * PostHog `distinct_id`: an authenticated user's id, or the one posthog-js
   * sent.
   */
  distinctId?: string
  /** PostHog session, the one a session recording is filed under. */
  sessionId?: string
}

/**
 * The identity of requests in flight, keyed by trace id. One trace = one
 * request (nginx's X-Request-ID is the trace root). A mutable store because no
 * frame wraps the whole request and neither OTel Baggage nor a late-entered
 * AsyncLocalStorage reaches frames already running. Lives on the process:
 * each Next entry gets its own copy of this module ({@link processStore}).
 */
interface IdentityStore {
  identities: Map<string, { identity: RequestIdentity; at: number }>
  /** The last sweep's clock, next to the map it trims. */
  lastSweep: number
}

function identityStore(): IdentityStore {
  return processStore('request-identities', () => ({
    identities: new Map(),
    lastSweep: 0,
  }))
}

/** A request lives seconds. The sweep is a leak stopper, not a clock: a stale
 * entry is unreachable anyway, 128 random bits never repeat. */
const IDENTITY_MAX_AGE_MS = 5 * 60 * 1000
const SWEEP_INTERVAL_MS = 60 * 1000

/** Attributes the request to its user and session. Must be called inside the
 * span whose trace id will carry the identity. */
export function identifyRequest(identity: RequestIdentity): void {
  if (!identity.distinctId && !identity.sessionId) {
    return
  }

  const traceId = trace.getActiveSpan()?.spanContext().traceId

  if (!traceId) {
    return
  }

  const store = identityStore()

  sweepIdentities(store)
  store.identities.set(traceId, { identity, at: Date.now() })
}

/** The identity of the request this trace belongs to, if it has been read. */
export function identityForTrace(
  traceId: string | undefined
): RequestIdentity | undefined {
  return traceId ? identityStore().identities.get(traceId)?.identity : undefined
}

/** The identity of the request being served, if it has been read yet. */
export function currentRequestIdentity(): RequestIdentity | undefined {
  return identityForTrace(trace.getActiveSpan()?.spanContext().traceId)
}

function sweepIdentities(store: IdentityStore): void {
  const now = Date.now()

  if (now - store.lastSweep < SWEEP_INTERVAL_MS) {
    return
  }

  store.lastSweep = now
  const oldest = now - IDENTITY_MAX_AGE_MS

  for (const [traceId, entry] of store.identities) {
    if (entry.at < oldest) {
      store.identities.delete(traceId)
    }
  }
}

/** Stamps the request's identity on every span at end time, so queries and
 * outgoing calls are attributed like the request. `onEnding` runs right before
 * the SDK freezes attributes, which is why spans opened before the session was
 * read — including the framework's request span — are reached too. */
class IdentitySpanProcessor implements SpanProcessor {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onStart(_span: Span): void {}

  /** The only hook that can still write attributes on an ending span. Declared
   * by the interface, flagged experimental by the SDK: the integration test
   * covers it, so an upgrade that breaks it fails the CI. */
  onEnding(span: Span): void {
    // The span's own trace: `end()` is called by whoever holds the span, not
    // necessarily inside it.
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
