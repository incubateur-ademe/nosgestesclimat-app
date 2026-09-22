import type { Context, Span } from '@opentelemetry/api'
import type {
  ReadableSpan,
  SpanProcessor,
} from '@opentelemetry/sdk-trace-base'

import { inheritedIdentity } from './request-identity'

/**
 * Stamps the request's identity on the spans started inside it: the database
 * queries and outgoing calls of a request are then attributed like the request
 * itself, which is what makes "the slow queries of this user" answerable.
 */
export class IdentitySpanProcessor implements SpanProcessor {
  onStart(span: Span, parentContext: Context): void {
    const identity = inheritedIdentity(parentContext)

    if (!identity) {
      return
    }

    if (identity.distinctId) {
      span.setAttribute('posthogDistinctId', identity.distinctId)
    }
    if (identity.sessionId) {
      span.setAttribute('sessionId', identity.sessionId)
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
