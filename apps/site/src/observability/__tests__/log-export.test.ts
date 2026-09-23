// @vitest-environment node
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

class TestException extends DomainError<'test_exception'> {
  public readonly actionId: string

  constructor(actionId: string) {
    super('test_exception', 'No rule')
    this.actionId = actionId
  }
}

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
    // The service stays on the line but not in the attributes: the resource
    // already carries it.
    expect(record.attributes.service).toBeUndefined()
    // Bindings, meta and identity all land flat: that is what PostHog queries.
    expect(record.attributes).toMatchObject({
      'ngc.component': 'core.service.engineRegistry',
      'ngc.job': 'simulation-computation',
      'ngc.attempt': 2,
      posthogDistinctId: 'user-1',
      sessionId: 'replay-1',
    })
    // The scope is the standard slot for "which unit emitted this", and takes
    // the component's qualified name as is.
    expect(record.instrumentationScope.name).toBe('core.service.engineRegistry')
    expect(record.spanContext?.traceId).toBe(spanTraceId)
  })

  it('flattens a nested meta into dotted attributes, which PostHog can query', () => {
    logger().info('engine built', { payload: { key: 'FR:current' } })

    const [record] = exporter.getFinishedLogRecords()
    expect(record.attributes['ngc.payload.key']).toBe('FR:current')
    expect(record.attributes['ngc.payload']).toBeUndefined()
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
    logger().error(new TestException('a1'))

    const [domainError, exception] = exporter.getFinishedLogRecords()
    expect(domainError.attributes['error.type']).toBe('test_domain_error')
    expect(exception.attributes).toMatchObject({
      'exception.type': 'TestException',
      'exception.message': 'No rule',
      'error.type': 'test_exception',
      'ngc.actionId': 'a1',
    })
  })

  it('leaves a line outside any request without an identity', () => {
    logger().info('worker bootstrap')

    const [record] = exporter.getFinishedLogRecords()
    expect(record.attributes).not.toHaveProperty('posthogDistinctId')
    expect(record.spanContext).toBeUndefined()
  })
})
