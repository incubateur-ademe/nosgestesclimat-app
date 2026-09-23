// @vitest-environment node
import { trace } from '@opentelemetry/api'
import {
  InMemorySpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base'
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import {
  IdentitySpanProcessor,
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

  beforeEach(() => {
    exporter.reset()
  })

  it('stamps the identity on the spans started once it is known', () => {
    const tracer = trace.getTracer('test')

    tracer.startActiveSpan('POST /fr/simulateur/bilan', (request) => {
      try {
        identifyRequest({ distinctId: 'user-1', sessionId: 'replay-1' })

        tracer.startActiveSpan('prisma:client:operation', (query) => {
          query.end()
        })
      } finally {
        request.end()
      }
    })

    const [query] = exporter.getFinishedSpans()
    // The child span inherits it: a slow query is attributed to its user.
    expect(query.attributes).toMatchObject({
      posthogDistinctId: 'user-1',
      sessionId: 'replay-1',
    })
  })

  it('survives a span opened around the read, and reaches later siblings', () => {
    const tracer = trace.getTracer('test')

    tracer.startActiveSpan('POST /fr/simulateur/bilan', (request) => {
      try {
        // `getUserSession` reads the session inside its own span: the identity
        // has to be readable outside it, and by the calls that follow.
        tracer.startActiveSpan('site.service.getUserSession', (session) => {
          identifyRequest({ distinctId: 'user-2', sessionId: 'replay-2' })
          session.end()
        })

        expect(currentRequestIdentity()).toEqual({
          distinctId: 'user-2',
          sessionId: 'replay-2',
        })

        tracer.startActiveSpan(
          'site.service.ensureSimulationModel',
          (sibling) => {
            sibling.end()
          }
        )
      } finally {
        request.end()
      }
    })

    const spans = exporter.getFinishedSpans()
    const request = spans.find(
      (span) => span.name === 'POST /fr/simulateur/bilan'
    )!
    // The request span was already open when the identity landed: `onEnd`
    // covers it, and it is the one PostHog shows as the request.
    expect(request.attributes).toMatchObject({
      posthogDistinctId: 'user-2',
      sessionId: 'replay-2',
    })
    const session = spans.find(
      (span) => span.name === 'site.service.getUserSession'
    )!
    const sibling = spans.find(
      (span) => span.name === 'site.service.ensureSimulationModel'
    )!
    expect(session.attributes).toMatchObject({ sessionId: 'replay-2' })
    expect(sibling.attributes).toMatchObject({
      posthogDistinctId: 'user-2',
      sessionId: 'replay-2',
    })
  })

  it('ignores an identity without any value', () => {
    identifyRequest({})
    expect(currentRequestIdentity()).toBeUndefined()
  })
})
