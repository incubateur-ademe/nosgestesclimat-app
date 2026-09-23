import { trace, type Span } from '@opentelemetry/api'
import { AsyncLocalStorage } from 'node:async_hooks'

export interface RequestIdentity {
  /** PostHog `distinct_id`: an authenticated user's id, or the one posthog-js sent. */
  distinctId?: string
  /** PostHog session, the one a session recording is filed under. */
  sessionId?: string
}

/**
 * The identity of the request being served, held outside the span tree.
 *
 * A span carries its own attributes, so keying the identity on one span means
 * losing it as soon as another becomes active — and every service now opens
 * one. An async-local store follows the request wherever it goes: the log
 * bridge reads it whatever span is active, and the span processor stamps every
 * span started after the session was read.
 *
 * OTel baggage would be the by-the-book carrier, but it can only be set around
 * the work (`context.with`), which means wrapping every action body.
 */
const identities = new AsyncLocalStorage<RequestIdentity>()

/**
 * Attributes the request to its user and PostHog session. The lines emitted
 * from here on reuse it, and so do the spans that start afterwards.
 */
export function identifyRequest(identity: RequestIdentity): void {
  if (!identity.distinctId && !identity.sessionId) {
    return
  }

  identities.enterWith(identity)

  // Best effort on the span that is active right now — its own span when the
  // session is read inside one. The framework's request span is already open
  // and keeps Next's attributes; nothing can reach back into it.
  setIdentityAttributes(trace.getActiveSpan(), identity)
}

/** The identity of the request being served, if it has been read yet. */
export function currentRequestIdentity(): RequestIdentity | undefined {
  return identities.getStore()
}

/** The two names PostHog matches, on a span as on a log record. */
export function setIdentityAttributes(
  span: Span | undefined,
  identity: RequestIdentity
): void {
  if (!span) {
    return
  }

  if (identity.distinctId) {
    span.setAttribute('posthogDistinctId', identity.distinctId)
  }
  if (identity.sessionId) {
    span.setAttribute('sessionId', identity.sessionId)
  }
}
