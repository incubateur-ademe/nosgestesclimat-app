// @vitest-environment node
import {
  InMemorySpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base'
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

import { DomainError } from '@nosgestesclimat/core/lib/errors'

import { createLogger } from '../logger'

class TestDomainError extends DomainError<'test_domain_error'> {
  public readonly actionId: string

  constructor(actionId = 'a1') {
    super('test_domain_error', 'Domain failure')
    this.actionId = actionId
  }
}

const createTestLogger = (rethrowControlFlow?: (error: unknown) => void) =>
  createLogger({
    service: 'site',
    level: 'debug',
    pretty: false,
    onCapture: vi.fn(),
    rethrowControlFlow,
  })

const noResult = () => Promise.resolve()

describe('withSpan', () => {
  const exporter = new InMemorySpanExporter()
  const provider = new NodeTracerProvider({
    spanProcessors: [new SimpleSpanProcessor(exporter)],
  })
  let lines: string[] = []

  beforeAll(() => {
    provider.register()
  })

  afterAll(async () => {
    await provider.shutdown()
  })

  beforeEach(() => {
    lines = []
    exporter.reset()
    vi.restoreAllMocks()
    // pino writes to stdout synchronously: capturing it keeps the assertions on
    // the real serialized line rather than on an intermediate representation.
    vi.spyOn(process.stdout, 'write').mockImplementation((chunk) => {
      lines.push(String(chunk))

      return true
    })
  })

  it('runs the body in a span named after the scope', async () => {
    const value = await createTestLogger().withSpan(
      'site.service.getGeolocation',
      () => Promise.resolve('EU')
    )

    expect(value).toBe('EU')
    const [span] = exporter.getFinishedSpans()
    expect(span.name).toBe('site.service.getGeolocation')
  })

  it('binds the scope to the logger of the body', async () => {
    await createTestLogger().withSpan(
      'site.service.getUserSession',
      (logger) => {
        logger.info('read')

        return noResult()
      }
    )

    const line = JSON.parse(lines[0]) as Record<string, unknown>
    expect(line['ngc.scope']).toBe('site.service.getUserSession')
  })

  it('gives an operation called from another its own nested span', async () => {
    const logger = createTestLogger()

    await logger.withSpan('site.service.completeSimulation', () =>
      logger.withSpan('core.sideEffect.joinedEmail', noResult)
    )

    const spans = exporter.getFinishedSpans()
    const outer = spans.find(
      (span) => span.name === 'site.service.completeSimulation'
    )!
    const inner = spans.find(
      (span) => span.name === 'core.sideEffect.joinedEmail'
    )!
    expect(inner.parentSpanContext?.spanId).toBe(outer.spanContext().spanId)
  })

  it('marks the span and lets the failure out', async () => {
    const failure = new Error('brevo is down')

    await expect(
      createTestLogger().withSpan('site.service.completeSimulation', () =>
        Promise.reject(failure)
      )
    ).rejects.toThrow(failure)

    const [span] = exporter.getFinishedSpans()
    expect(span.status.code).toBe(2)
    // What the semantic conventions ask: the message as the status description,
    // the exception as an event.
    expect(span.status.message).toBe('brevo is down')
    expect(span.events.map((event) => event.name)).toContain('exception')
  })

  it('carries on the span what the error class carries, like the line does', async () => {
    const failure = new TestDomainError('action-1')

    await expect(
      createTestLogger().withSpan('site.service.assessActions', () =>
        Promise.reject(failure)
      )
    ).rejects.toThrow(failure)

    const [span] = exporter.getFinishedSpans()
    // The same names as the log line: one filter reads a failed span and the
    // line that reports it.
    expect(span.attributes).toMatchObject({
      'error.type': 'test_domain_error',
      'ngc.actionId': 'action-1',
    })
  })

  it('lets a control-flow error through without failing the span', async () => {
    // What Next injects: `unstable_rethrow` rethrows a redirect or a
    // `notFound()`, and returns on anything else.
    const rethrowControlFlow = vi.fn(() => {
      throw new Error('NEXT_REDIRECT')
    })

    await expect(
      createTestLogger(rethrowControlFlow).withSpan(
        'site.service.getLatestSimulationResult',
        () => Promise.reject(new Error('NEXT_REDIRECT'))
      )
    ).rejects.toThrow('NEXT_REDIRECT')

    expect(rethrowControlFlow).toHaveBeenCalled()
    const [span] = exporter.getFinishedSpans()
    expect(span.status.code).not.toBe(2)
    expect(span.events.map((event) => event.name)).not.toContain('exception')
  })
})
