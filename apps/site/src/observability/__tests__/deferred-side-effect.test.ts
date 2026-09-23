// @vitest-environment node
import { trace } from '@opentelemetry/api'
import { logs } from '@opentelemetry/api-logs'
import {
  InMemoryLogRecordExporter,
  LoggerProvider,
  SimpleLogRecordProcessor,
} from '@opentelemetry/sdk-logs'
import {
  InMemorySpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base'
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node'
import { AsyncLocalStorage } from 'node:async_hooks'
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import { DomainError } from '@nosgestesclimat/core/lib/errors'
import { failure } from '@nosgestesclimat/core/lib/result'
import { runSideEffect } from '@nosgestesclimat/core/lib/run-side-effect'

import { createLogger } from '../../logger'
import { IdentitySpanProcessor, identifyRequest } from '../request-identity'

class TestSideEffectError extends DomainError<'test_side_effect_error'> {
  constructor() {
    super('test_side_effect_error', 'Side effect failed')
  }
}

/**
 * What Next's `after()` does with the callback: `AsyncLocalStorage.bind`
 * (next/dist/server/app-render/async-local-storage, called on the callback to
 * "preserve all currently available ALS-es" — the request's OTel context
 * included). The work then runs after the response, in another frame: an
 * `enterWith` could not have carried the identity there, which is why the trace
 * id keys it.
 *
 * Next's helper is not imported here on purpose: it resolves
 * `globalThis.AsyncLocalStorage` once, and that global is undefined under
 * vitest — where it degrades to a no-op that binds nothing. The static method
 * is what it calls in a real Node process.
 */
const afterLikeRunner = (deferred: (() => Promise<void>)[]) => {
  return (task: () => Promise<void>) => {
    deferred.push(AsyncLocalStorage.bind(task))
  }
}

describe('deferred side effect', () => {
  const spanExporter = new InMemorySpanExporter()
  const logExporter = new InMemoryLogRecordExporter()
  const tracerProvider = new NodeTracerProvider({
    spanProcessors: [
      // As `setup.ts` wires it: the identity lands on the spans on their way out.
      new IdentitySpanProcessor(),
      new SimpleSpanProcessor(spanExporter),
    ],
  })
  const loggerProvider = new LoggerProvider({
    processors: [new SimpleLogRecordProcessor({ exporter: logExporter })],
  })

  beforeAll(() => {
    tracerProvider.register()
    logs.setGlobalLoggerProvider(loggerProvider)
  })

  afterAll(async () => {
    await tracerProvider.shutdown()
    await loggerProvider.shutdown()
  })

  beforeEach(() => {
    spanExporter.reset()
    logExporter.reset()
    vi.spyOn(process.stdout, 'write').mockImplementation(() => true)
  })

  it('keeps the identity of the request it outlives', async () => {
    const deferred: (() => Promise<void>)[] = []
    const logger = createLogger({
      service: 'site',
      level: 'debug',
      pretty: false,
      onCapture: vi.fn(),
    })

    await trace
      .getTracer('test')
      .startActiveSpan('POST /fr/simulateur/bilan', async (request) => {
        try {
          // `getUserSession`, in its real shape: the session is in the headers,
          // so the identity is filed after an `await`, inside its own span.
          await trace
            .getTracer('test')
            .startActiveSpan('site.service.getUserSession', async (session) => {
              try {
                await Promise.resolve()
                identifyRequest({
                  distinctId: 'user-1',
                  sessionId: 'replay-1',
                })
              } finally {
                session.end()
              }
            })

          runSideEffect(
            { logger, backgroundTaskRunner: afterLikeRunner(deferred) },
            'joinedEmail',
            () => Promise.resolve(failure(new TestSideEffectError())),
            { pollId: 'poll-1' }
          )
        } finally {
          request.end()
        }
      })

    // The response is sent: the deferred work runs, outside the request's frame.
    expect(deferred).toHaveLength(1)
    await deferred[0]?.()

    const [record] = logExporter.getFinishedLogRecords()
    expect(record.attributes).toMatchObject({
      'ngc.sideEffect': 'joinedEmail',
      'ngc.pollId': 'poll-1',
      posthogDistinctId: 'user-1',
      sessionId: 'replay-1',
    })

    const spans = spanExporter.getFinishedSpans()
    const requestSpan = spans.find(
      (span) => span.name === 'POST /fr/simulateur/bilan'
    )!
    const sideEffect = spans.find(
      (span) => span.name === 'core.sideEffect.joinedEmail'
    )!
    // The work stayed in the request's trace — it did not open a new one — and
    // its span is attributed like the request it outlives.
    expect(sideEffect.spanContext().traceId).toBe(
      requestSpan.spanContext().traceId
    )
    expect(sideEffect.attributes).toMatchObject({
      posthogDistinctId: 'user-1',
      sessionId: 'replay-1',
    })
  })
})
