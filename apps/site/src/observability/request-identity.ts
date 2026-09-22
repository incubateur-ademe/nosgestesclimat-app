import { trace, type Context, type Span } from '@opentelemetry/api'

export interface RequestIdentity {
  /** PostHog `distinct_id`: an authenticated user's id, or the one posthog-js sent. */
  distinctId?: string
  /** PostHog session, the one a session recording is filed under. */
  sessionId?: string
}

/**
 * The identity of a request, held against the span that carries it.
 *
 * OTel baggage is the usual carrier, but it can only be set around the work
 * (`context.with`), which would mean wrapping every action body to attribute
 * it. The request span *is* the per-request scope, and it is already active by
 * the time the session is read, so it carries the identity instead.
 */
const identities = new WeakMap<Span, RequestIdentity>()

/**
 * Attributes the current request to its user and PostHog session: the span
 * carries the attributes (PostHog links the trace to the person and to the
 * recording) and the lines emitted while it is active reuse them.
 */
export function identifyRequest(identity: RequestIdentity): void {
  const span = trace.getActiveSpan()

  // No span means no request scope (a unit test, an uninstrumented runtime):
  // there is nothing to attribute.
  if (!span || (!identity.distinctId && !identity.sessionId)) {
    return
  }

  identities.set(span, identity)

  // Same attribute names as the log records: PostHog reads them both ways.
  if (identity.distinctId) {
    span.setAttribute('posthogDistinctId', identity.distinctId)
  }
  if (identity.sessionId) {
    span.setAttribute('sessionId', identity.sessionId)
  }
}

/** The identity of the span being logged for, if any. */
export function currentRequestIdentity(): RequestIdentity | undefined {
  const span = trace.getActiveSpan()

  return span ? identities.get(span) : undefined
}

/** Reads the identity off a parent span, for the spans started inside it. */
export function inheritedIdentity(parentContext: Context): RequestIdentity | undefined {
  const parent = trace.getSpan(parentContext)

  return parent ? identities.get(parent) : undefined
}
