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

import { createLogger } from '../../logger/logger.node'
import { IdentitySpanProcessor, identifyRequest } from '../request-identity'

class TestSideEffectError extends DomainError<'test_side_effect_error'> {
  constructor() {
    super('test_side_effect_error', 'Side effect failed')
  }
}

/** Stands in for Next's `after()`: binds the task with `AsyncLocalStorage.bind`
 * so the deferred work keeps the request's OTel context. Next's helper is not
 * imported: it resolves `globalThis.AsyncLocalStorage` once, undefined under
 * vitest, degrading to a no-op. */
const nextAfterRunner = (deferred: (() => Promise<void>)[]) => {
  return (task: () => Promise<void>) => {
    deferred.push(AsyncLocalStorage.bind(task))
  }
}

describe('deferred side effect', () => {
  const spanExporter = new InMemorySpanExporter()
  const logExporter = new InMemoryLogRecordExporter()
  const tracerProvider = new NodeTracerProvider({
    spanProcessors: [
      // `setup.ts` wires it this way: the identity lands on the spans on their
      // way out.
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
      service: 'web-server',
      level: 'debug',
      pretty: false,
      onCapture: vi.fn(),
    })

    trace
      .getTracer('test')
      .startActiveSpan('POST /fr/simulateur/bilan', (request) => {
        try {
          // What the proxy does, where it does it: the identity is filed early,
          // in the request's own trace, and read long after — once the deferred
          // work runs, the frame that filed it is gone.
          identifyRequest({ distinctId: 'user-1', sessionId: 'replay-1' })

          runSideEffect(
            'joinedEmail',
            {
              logger: logger.child({ pollId: 'poll-1' }),
              backgroundTaskRunner: nextAfterRunner(deferred),
            },
            () => Promise.resolve(failure(new TestSideEffectError()))
          )
        } finally {
          request.end()
        }
      })

    // The response is sent: the deferred work runs outside the request's
    // frame.
    expect(deferred).toHaveLength(1)
    await deferred[0]?.()

    const [record] = logExporter.getFinishedLogRecords()
    // The scope names the span that scoped the line; the caller's bindings
    // travel with the logger, not through a parameter.
    expect(record.attributes).toMatchObject({
      'ngc.scope': 'core.sideEffect.joinedEmail',
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
    // The work stayed in the request's trace (it did not open a new one), and
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
