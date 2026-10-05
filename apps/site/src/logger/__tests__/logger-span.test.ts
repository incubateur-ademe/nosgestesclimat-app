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

import { createLogger } from '../logger.node'

class TestDomainError extends DomainError<'test_domain_error'> {
  public readonly actionId: string

  constructor(actionId = 'a1') {
    super('test_domain_error', 'Domain failure')
    this.actionId = actionId
  }
}

const createTestLogger = (rethrowControlFlow?: (error: unknown) => void) =>
  createLogger({
    service: 'web-server',
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
      'site.action.getGeolocation',
      () => Promise.resolve('EU')
    )

    expect(value).toBe('EU')
    const [span] = exporter.getFinishedSpans()
    expect(span.name).toBe('site.action.getGeolocation')
  })

  it('binds the scope to the logger of the body', async () => {
    await createTestLogger().withSpan(
      'site.action.getUserSession',
      (logger) => {
        logger.info('read')

        return noResult()
      }
    )

    const line = JSON.parse(lines[0]) as Record<string, unknown>
    expect(line['ngc.scope']).toBe('site.action.getUserSession')
  })

  it('gives an operation called from another its own nested span', async () => {
    const logger = createTestLogger()

    await logger.withSpan('site.action.completeSimulation', () =>
      logger.withSpan('core.sideEffect.joinedEmail', noResult)
    )

    const spans = exporter.getFinishedSpans()
    const outer = spans.find(
      (span) => span.name === 'site.action.completeSimulation'
    )!
    const inner = spans.find(
      (span) => span.name === 'core.sideEffect.joinedEmail'
    )!
    expect(inner.parentSpanContext?.spanId).toBe(outer.spanContext().spanId)
  })

  it("puts the logger's bindings on the span, like on the lines", async () => {
    await createTestLogger()
      .child({ simulationId: 'sim-1' })
      .withSpan('core.sideEffect.joinedEmail', noResult)

    const [span] = exporter.getFinishedSpans()
    expect(span.attributes).toMatchObject({ 'ngc.simulationId': 'sim-1' })
  })

  it('keeps the service off the span, where the resource already names it', async () => {
    await createTestLogger().withSpan(
      'site.action.getUserSession',
      (logger) => {
        logger.info('read')

        return noResult()
      }
    )

    const [span] = exporter.getFinishedSpans()
    // On a span that inherits no binding, a bare `service` would be its only
    // attribute, naming twice what the resource names once.
    expect(span.attributes.service).toBeUndefined()

    // The stdout line keeps it: `base` is there for the line, not the export.
    const line = JSON.parse(lines[0]) as Record<string, unknown>
    expect(line.service).toBe('web-server')
  })

  it('does not carry a parent scope onto a nested span', async () => {
    const logger = createTestLogger()

    await logger.withSpan('site.action.completeSimulation', (inner) =>
      inner.withSpan('core.sideEffect.joinedEmail', noResult)
    )

    const inner = exporter
      .getFinishedSpans()
      .find((span) => span.name === 'core.sideEffect.joinedEmail')!
    expect(inner.attributes['ngc.scope']).toBeUndefined()
  })

  it('annotates the span without touching the lines', async () => {
    await createTestLogger().withSpan(
      'core.service.computePollStats',
      (logger) => {
        logger.setSpanAttribute('participantsCount', 42)
        logger.info('measured')

        return noResult()
      }
    )

    const [span] = exporter.getFinishedSpans()
    expect(span.attributes).toMatchObject({ 'ngc.participantsCount': 42 })
    // The measurement annotates the span only: lines keep the bindings.
    const line = JSON.parse(lines[0]) as Record<string, unknown>
    expect(line['ngc.participantsCount']).toBeUndefined()
  })

  it('marks the span and lets the failure out', async () => {
    const failure = new Error('brevo is down')

    await expect(
      createTestLogger().withSpan('site.action.completeSimulation', () =>
        Promise.reject(failure)
      )
    ).rejects.toThrow(failure)

    const [span] = exporter.getFinishedSpans()
    expect(span.status.code).toBe(2)
    // What the semantic conventions ask: the message as the status description,
    // the exception as an event.
    expect(span.status.message).toBe('brevo is down')
    expect(span.events.map((event) => event.name)).toContain('exception')
    // And as attributes: PostHog ingests span attributes and drops events, so
    // the event alone would leave a failed trace without its cause.
    expect(span.attributes).toMatchObject({
      'exception.type': 'Error',
      'exception.message': 'brevo is down',
    })
  })

  it('carries on the span what the error class carries, like the line does', async () => {
    const failure = new TestDomainError('action-1')

    await expect(
      createTestLogger().withSpan('site.action.assessActions', () =>
        Promise.reject(failure)
      )
    ).rejects.toThrow(failure)

    const [span] = exporter.getFinishedSpans()
    // The same names as the log line: one filter reads a failed span and the
    // line that reports it. The exception takes the `code`, which survives
    // minification, not the class name the build renames.
    expect(span.attributes).toMatchObject({
      'error.type': 'test_domain_error',
      'exception.type': 'test_domain_error',
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
        'site.action.getLatestSimulationResult',
        () => Promise.reject(new Error('NEXT_REDIRECT'))
      )
    ).rejects.toThrow('NEXT_REDIRECT')

    expect(rethrowControlFlow).toHaveBeenCalled()
    const [span] = exporter.getFinishedSpans()
    expect(span.status.code).not.toBe(2)
    expect(span.events.map((event) => event.name)).not.toContain('exception')
  })
})
