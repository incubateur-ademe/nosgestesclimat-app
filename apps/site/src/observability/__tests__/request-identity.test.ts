// @vitest-environment node
import { trace } from '@opentelemetry/api'
import {
  InMemorySpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base'
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { IdentitySpanProcessor } from '../identity-span-processor'
import {
  currentRequestIdentity,
  identifyRequest,
} from '../request-identity'

describe('request identity', () => {
  const exporter = new InMemorySpanExporter()
  const provider = new NodeTracerProvider({
    spanProcessors: [
      new IdentitySpanProcessor(),
      new SimpleSpanProcessor(exporter),
    ],
  })

  beforeAll(() => {
    provider.register()
  })

  afterAll(async () => {
    await provider.shutdown()
  })

  it('stamps the identity on the request span and the spans started inside it', () => {
    const tracer = trace.getTracer('test')

    tracer.startActiveSpan('POST /fr/simulateur/bilan', (request) => {
      try {
        identifyRequest({ distinctId: 'user-1', sessionId: 'replay-1' })
        expect(currentRequestIdentity()).toEqual({
          distinctId: 'user-1',
          sessionId: 'replay-1',
        })

        tracer.startActiveSpan('prisma:client:operation', (query) => {
          query.end()
        })
      } finally {
        request.end()
      }
    })

    const [query, request] = exporter.getFinishedSpans()
    expect(request.attributes).toMatchObject({
      posthogDistinctId: 'user-1',
      sessionId: 'replay-1',
    })
    // The child span inherits it: a slow query is attributed to its user.
    expect(query.attributes).toMatchObject({
      posthogDistinctId: 'user-1',
      sessionId: 'replay-1',
    })
  })

  it('ignores an identity without any value and outside a request', () => {
    identifyRequest({})
    expect(currentRequestIdentity()).toBeUndefined()

    trace.getTracer('test').startActiveSpan('POST /', (span) => {
      try {
        identifyRequest({ sessionId: 'replay-2' })
        expect(currentRequestIdentity()).toEqual({ sessionId: 'replay-2' })
      } finally {
        span.end()
      }
    })
  })
})
