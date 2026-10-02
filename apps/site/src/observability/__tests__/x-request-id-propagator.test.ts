// @vitest-environment node
import {
  context,
  trace,
  TraceFlags,
  type TextMapGetter,
} from '@opentelemetry/api'
import {
  CompositePropagator,
  W3CTraceContextPropagator,
} from '@opentelemetry/core'
import { describe, expect, it } from 'vitest'

import { XRequestIdPropagator } from '../x-request-id-propagator'

const getter: TextMapGetter<Record<string, string>> = {
  get: (carrier, key) => carrier[key],
  keys: (carrier) => Object.keys(carrier),
}

const propagator = new XRequestIdPropagator()

const extract = (headers: Record<string, string>) =>
  propagator.extract(context.active(), headers, getter)

describe('XRequestIdPropagator', () => {
  it('adopts a 32 hex request id as the trace id', () => {
    const requestId = 'b'.repeat(32)

    const extracted = extract({ 'x-request-id': requestId })

    expect(trace.getSpanContext(extracted)).toMatchObject({
      traceId: requestId,
      traceFlags: TraceFlags.SAMPLED,
      isRemote: true,
    })
  })

  it.each([
    ['too short', 'abc'],
    ['uppercase', 'B'.repeat(32)],
    ['not hexadecimal', 'z'.repeat(32)],
    ['absent', undefined],
  ])('ignores an unusable request id (%s)', (_label, value) => {
    const extracted = extract(value ? { 'x-request-id': value } : {})

    expect(trace.getSpanContext(extracted)).toBeUndefined()
  })

  it('lets a W3C traceparent win over the request id', () => {
    const traceId = 'a'.repeat(32)
    const composite = new CompositePropagator({
      propagators: [new W3CTraceContextPropagator(), propagator],
    })

    const extracted = composite.extract(
      context.active(),
      {
        traceparent: `00-${traceId}-${'c'.repeat(16)}-01`,
        'x-request-id': 'b'.repeat(32),
      },
      getter
    )

    expect(trace.getSpanContext(extracted)?.traceId).toBe(traceId)
  })
})
