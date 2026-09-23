import type { Span } from '@opentelemetry/api'
import type { ReadableSpan, SpanProcessor } from '@opentelemetry/sdk-trace-base'

import {
  currentRequestIdentity,
  setIdentityAttributes,
} from './request-identity.ts'

/**
 * Stamps the request's identity on every span started once the session is
 * known: the database queries and outgoing calls of a request are then
 * attributed like the request itself, which is what makes "the slow queries of
 * this user" answerable.
 *
 * The identity is read from the request's async store, not from the parent
 * span: a span opened between the session read and the query would break the
 * parent chain.
 */
export class IdentitySpanProcessor implements SpanProcessor {
  onStart(span: Span): void {
    const identity = currentRequestIdentity()

    if (identity) {
      setIdentityAttributes(span, identity)
    }
  }

  // The batch processor exports the spans; this one only decorates them.
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onEnd(_span: ReadableSpan): void {}

  forceFlush(): Promise<void> {
    return Promise.resolve()
  }

  shutdown(): Promise<void> {
    return Promise.resolve()
  }
}
