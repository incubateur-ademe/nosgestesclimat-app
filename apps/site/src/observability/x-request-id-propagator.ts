import {
  trace,
  TraceFlags,
  type Context,
  type TextMapGetter,
  type TextMapPropagator,
  type TextMapSetter,
} from '@opentelemetry/api'
import { randomBytes } from 'node:crypto'

/** nginx `$request_id`: 32 lowercase hex characters — the shape of a W3C trace id. */
const REQUEST_ID_PATTERN = /^[0-9a-f]{32}$/
const REQUEST_ID_HEADER = 'x-request-id'

/**
 * Adopts nginx's `X-Request-ID` as the trace id.
 *
 * The edge already generates one per request and the collector writes it as
 * `trace_id` on the nginx logs exported to PostHog (`infra/nginx`). Continuing
 * that id here is what makes one request readable as a single trace from the
 * edge to the database.
 */
export class XRequestIdPropagator implements TextMapPropagator {
  fields(): string[] {
    return [REQUEST_ID_HEADER]
  }

  inject(_context: Context, _carrier: unknown, _setter: TextMapSetter): void {
    // Outgoing requests get their traceparent from the W3C propagator.
  }

  extract(context: Context, carrier: unknown, getter: TextMapGetter): Context {
    // A `traceparent` names a real parent span: it wins over an opaque id.
    if (trace.getSpanContext(context)) {
      return context
    }

    const header = getter.get(carrier, REQUEST_ID_HEADER)
    const requestId = Array.isArray(header) ? header[0] : header

    if (typeof requestId !== 'string' || !REQUEST_ID_PATTERN.test(requestId)) {
      return context
    }

    return trace.setSpanContext(context, {
      traceId: requestId,
      // nginx emits no span of its own: this one stands in for the edge.
      spanId: randomBytes(8).toString('hex'),
      traceFlags: TraceFlags.SAMPLED,
      isRemote: true,
    })
  }
}
