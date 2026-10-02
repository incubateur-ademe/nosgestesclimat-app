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
 * The identity of the requests in flight, keyed by trace id.
 *
 * The identity must be readable from every frame of the request, and no frame
 * of user code wraps the whole of it. The pattern that solves this is
 * Sentry's: a mutable scope entered at the request root, mutated along the way
 * (`setUser`), read late (at capture time). Sentry enters it at the root
 * because its SDK wraps every entry point at build time — a loader we do not
 * have, and no hook Next or the OTel SDK exposes to application code replaces
 * it.
 *
 * OTel baggage, the by-the-book carrier, cannot substitute: the Context is
 * immutable, `setBaggage` only takes effect inside a `context.with` callback,
 * and no API re-ambients an already-running chain — the frames above (the rest
 * of the handler, the request span ending last) keep the old Context. Same
 * geometry for an `AsyncLocalStorage` entered where the session is read, after
 * an `await`: it covers its own continuation only.
 *
 * The trace id is the request key instead: `XRequestIdPropagator` makes
 * nginx's per-request id the trace root, so one trace is one request. That is
 * the invariant this Map rests on; were it broken, identities would silently
 * bleed across requests. Consumers find the identity from the span they
 * already handle: the log bridge from the active span, the span processor from
 * the span it decorates.
 *
 * The store lives on the process ({@link processStore}), not in this module:
 * the proxy is one entry of the Next build and writes it, the instrumentation
 * and every route are others and read it, and each entry gets its own copy of
 * the modules it embeds.
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

/**
 * Stamps the request's identity on every span of the request, so the database
 * queries and the outgoing calls are attributed like the request itself — which
 * is what makes "the slow queries of this user" answerable.
 *
 * `onEnding` alone covers the whole request: it runs for every recorded span,
 * right before the SDK freezes the attributes (`setAttribute` past `end()` is
 * ignored). It therefore reaches the spans opened before the session was read,
 * the framework's request span above all — the one PostHog shows as the
 * request. A span never ended is never exported, so not hooking `onStart`
 * misses nothing.
 */
class IdentitySpanProcessor implements SpanProcessor {
  // The SDK calls `onStart` and `onEnd` unconditionally: they stay empty on
  // purpose.
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onStart(_span: Span): void {}

  /**
   * The only hook that can still write attributes on an ending span, and the
   * one the identity is stamped in. Declared by the interface, flagged
   * experimental by the SDK: an integration test against the real SDK covers
   * it, so an upgrade that breaks it fails the CI.
   */
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
