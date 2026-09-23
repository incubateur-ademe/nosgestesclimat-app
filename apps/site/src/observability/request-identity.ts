import { type Span } from '@opentelemetry/api'
import type { ReadableSpan, SpanProcessor } from '@opentelemetry/sdk-trace-base'
import { AsyncLocalStorage } from 'node:async_hooks'

import { POSTHOG_IDENTITY_ATTRIBUTES } from '@nosgestesclimat/core/features/logger/attribute-key'

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
 * span of the request with it.
 *
 * OTel baggage would be the by-the-book carrier, but it can only be set around
 * the work (`context.with`), which means wrapping every action body.
 */
const identities = new AsyncLocalStorage<RequestIdentity>()

/**
 * Attributes the request to its user and PostHog session. The lines emitted
 * from here on reuse it, and so do every span of the request.
 */
export function identifyRequest(identity: RequestIdentity): void {
  if (!identity.distinctId && !identity.sessionId) {
    return
  }

  identities.enterWith(identity)
}

/** The identity of the request being served, if it has been read yet. */
export function currentRequestIdentity(): RequestIdentity | undefined {
  return identities.getStore()
}

/**
 * Stamps the request's identity on every span of the request: the database
 * queries and outgoing calls are then attributed like the request itself,
 * which is what makes "the slow queries of this user" answerable.
 *
 * The identity is read from the request's async store, not from the parent
 * span: a span opened between the session read and the query would break the
 * parent chain.
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
    stamp(span, currentRequestIdentity())
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
