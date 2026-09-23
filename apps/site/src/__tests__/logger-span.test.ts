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

import { createLogger } from '../logger'

const createTestLogger = (rethrowControlFlow?: (error: unknown) => void) =>
  createLogger({
    service: 'site',
    level: 'debug',
    pretty: false,
    onCapture: vi.fn(),
    rethrowControlFlow,
  })

const noResult = () => Promise.resolve()

describe('withChildSpan', () => {
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
    const value = await createTestLogger().withChildSpan(
      'site.service.getGeolocation',
      () => Promise.resolve('EU')
    )

    expect(value).toBe('EU')
    const [span] = exporter.getFinishedSpans()
    expect(span.name).toBe('site.service.getGeolocation')
  })

  it('binds the scope to the logger of the body', async () => {
    await createTestLogger().withChildSpan(
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

    await logger.withChildSpan('site.service.completeSimulation', () =>
      logger.withChildSpan('core.sideEffect.joinedEmail', noResult)
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
      createTestLogger().withChildSpan('site.service.completeSimulation', () =>
        Promise.reject(failure)
      )
    ).rejects.toThrow(failure)

    const [span] = exporter.getFinishedSpans()
    expect(span.status.code).toBe(2)
    expect(span.events.map((event) => event.name)).toContain('exception')
  })

  it('lets a control-flow error through without failing the span', async () => {
    // What Next injects: `unstable_rethrow` rethrows a redirect or a
    // `notFound()`, and returns on anything else.
    const rethrowControlFlow = vi.fn(() => {
      throw new Error('NEXT_REDIRECT')
    })

    await expect(
      createTestLogger(rethrowControlFlow).withChildSpan(
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
