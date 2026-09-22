// @vitest-environment node
import { Exception } from '@nosgestesclimat/core/exception'
import { DomainError } from '@nosgestesclimat/core/lib/errors'
import { trace } from '@opentelemetry/api'
import { logs } from '@opentelemetry/api-logs'
import {
  InMemoryLogRecordExporter,
  LoggerProvider,
  SimpleLogRecordProcessor,
} from '@opentelemetry/sdk-logs'
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node'
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import { createLogger } from '../../logger'
import { identifyRequest } from '../request-identity'

class TestDomainError extends DomainError<'test_domain_error'> {
  constructor() {
    super('test_domain_error', 'Domain failure')
  }
}

class TestException extends Exception<{ actionId: string }> {}

describe('log export', () => {
  const exporter = new InMemoryLogRecordExporter()
  const loggerProvider = new LoggerProvider({
    processors: [new SimpleLogRecordProcessor({ exporter })],
  })
  const tracerProvider = new NodeTracerProvider()

  beforeAll(() => {
    logs.setGlobalLoggerProvider(loggerProvider)
    tracerProvider.register()
  })

  afterAll(async () => {
    await loggerProvider.shutdown()
    await tracerProvider.shutdown()
  })

  beforeEach(() => {
    exporter.reset()
    vi.spyOn(process.stdout, 'write').mockImplementation(() => true)
  })

  const logger = () =>
    createLogger({
      service: 'site',
      level: 'debug',
      pretty: false,
      onCapture: vi.fn(),
    })

  it('ships the line with its severity, attributes and the trace it belongs to', () => {
    let spanTraceId: string | undefined

    trace
      .getTracer('test')
      .startActiveSpan('POST /fr/simulateur/bilan', (span) => {
        try {
          identifyRequest({ distinctId: 'user-1', sessionId: 'replay-1' })
          logger()
            .child({
              component: 'core.service.engineRegistry',
              job: 'simulation-computation',
            })
            .warn('job failed', { attempt: 2 })
          spanTraceId = span.spanContext().traceId
        } finally {
          span.end()
        }
      })

    const [record] = exporter.getFinishedLogRecords()
    expect(record.body).toBe('job failed')
    expect(record.severityText).toBe('warn')
    // Bindings, meta and identity all land flat: that is what PostHog queries.
    expect(record.attributes).toMatchObject({
      component: 'core.service.engineRegistry',
      job: 'simulation-computation',
      attempt: 2,
      posthogDistinctId: 'user-1',
      sessionId: 'replay-1',
    })
    // The scope is the standard slot for "which unit emitted this", and takes
    // the component's qualified name as is.
    expect(record.instrumentationScope.name).toBe('core.service.engineRegistry')
    expect(record.spanContext?.traceId).toBe(spanTraceId)
  })

  it('flattens a nested meta into dotted attributes, which PostHog can query', () => {
    logger().info('engine built', { engine: { key: 'FR:current' } })

    const [record] = exporter.getFinishedLogRecords()
    expect(record.attributes['engine.key']).toBe('FR:current')
    expect(record.attributes.engine).toBeUndefined()
  })

  it('drops from the export what the level drops from stdout', () => {
    createLogger({
      service: 'site',
      level: 'warn',
      pretty: false,
      onCapture: vi.fn(),
    }).info('too quiet')

    expect(exporter.getFinishedLogRecords()).toHaveLength(0)
  })

  it('writes the exception as the attributes OTel names for it', () => {
    logger().error(
      new Error('brevo is down', { cause: new Error('socket closed') })
    )

    const [record] = exporter.getFinishedLogRecords()
    expect(record.severityText).toBe('error')
    expect(record.attributes).toMatchObject({
      'exception.type': 'Error',
      'exception.message': 'brevo is down',
    })
    const stacktrace = record.attributes['exception.stacktrace']
    expect(stacktrace).toEqual(expect.stringContaining('Error: brevo is down'))
    expect(stacktrace).toEqual(
      expect.stringContaining('Caused by: Error: socket closed')
    )
  })

  it('writes the fields the error class carries, flattened', () => {
    logger().error(new TestDomainError())
    logger().error(new TestException({ message: 'No rule', actionId: 'a1' }))

    const [domainError, exception] = exporter.getFinishedLogRecords()
    expect(domainError.attributes.code).toBe('test_domain_error')
    expect(exception.attributes).toMatchObject({
      'exception.type': 'TestException',
      'exception.message': 'No rule',
      'level.domain': 'error',
      'payload.actionId': 'a1',
    })
  })

  it('leaves a line outside any request without an identity', () => {
    logger().info('worker bootstrap')

    const [record] = exporter.getFinishedLogRecords()
    expect(record.attributes).not.toHaveProperty('posthogDistinctId')
    expect(record.spanContext).toBeUndefined()
  })
})
