// @vitest-environment jsdom
/* eslint-disable no-console -- the console is the sink under test */
import type {
  Logger,
  ScopeName,
} from '@nosgestesclimat/core/features/logger/index'
import type { Logger as PosthogLogger } from 'posthog-js'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { posthogLogger, posthogCaptureException } = vi.hoisted(() => ({
  posthogLogger: {
    trace: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    fatal: vi.fn(),
  },
  posthogCaptureException: vi.fn(),
}))

vi.mock('posthog-js', () => ({
  default: { logger: posthogLogger, captureException: posthogCaptureException },
}))

import clientLogger, {
  BrowserLoggerOnServerError,
  createBrowserLogger,
} from '../logger.browser'

/** Runs a body in its own span, now: the shape the decorator wraps. */
const runInSpan = <Result>(
  logger: Logger,
  scope: ScopeName,
  run: (logger: Logger) => Promise<Result>
): Promise<Result> =>
  logger.withSpan(scope, async ({ logger }) => await run(logger))()
describe('createBrowserLogger', () => {
  let logger: Logger

  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'debug').mockImplementation(() => undefined)
    vi.spyOn(console, 'info').mockImplementation(() => undefined)
    vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    vi.spyOn(console, 'error').mockImplementation(() => undefined)

    logger = createBrowserLogger({ verbosity: 'debug' })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  /**
   * The line as a developer reads it: the message first, then the attributes —
   * the keys of the exported record, so a line read here is also a search.
   */
  const consoleCall = (method: 'debug' | 'info' | 'warn' | 'error' = 'info') =>
    vi.mocked(console[method]).mock.calls.at(-1) as
      | [string, Record<string, unknown>]
      | undefined

  const consoleLine = (method: 'debug' | 'info' | 'warn' | 'error' = 'info') =>
    consoleCall(method)?.[1]

  it('sends the same line to the console and to PostHog', () => {
    logger.info('hello')

    const [message, line] = consoleCall() ?? []
    expect(message).toBe('hello')
    expect(line).toMatchObject({ service: 'browser' })
    // `service` stays off the attributes: the OTLP resource carries
    // `service.name` already.
    expect(posthogLogger.info).toHaveBeenCalledWith('hello', {})
  })

  it('flattens a nested meta into dotted keys, the shape of the export', () => {
    logger.info('engine built', { payload: { key: 'FR:current' } })

    expect(consoleLine()?.['ngc.payload.key']).toBe('FR:current')
    expect(posthogLogger.info).toHaveBeenCalledWith('engine built', {
      'ngc.payload.key': 'FR:current',
    })
  })

  it('leaves an attribute another party named alone', () => {
    logger.info('request done', { 'http.request.method': 'GET' })

    expect(posthogLogger.info).toHaveBeenCalledWith('request done', {
      'http.request.method': 'GET',
    })
  })

  it('drops a line below its level from both sinks', () => {
    const quietLogger = createBrowserLogger({ verbosity: 'warn' })

    quietLogger.info('ignored')

    expect(console.info).not.toHaveBeenCalled()
    expect(posthogLogger.info).not.toHaveBeenCalled()
  })

  it('writes nothing at all when set to `silent`', () => {
    const silentLogger = createBrowserLogger({ verbosity: 'silent' })

    silentLogger.error(new Error('engine blew up'))

    expect(console.error).not.toHaveBeenCalled()
    expect(posthogLogger.error).not.toHaveBeenCalled()
    expect(posthogCaptureException).not.toHaveBeenCalled()
  })

  it('merges child bindings into every following line', () => {
    logger.child({ simulationId: 'sim_1' }).warn('slow evaluation')

    expect(consoleLine('warn')?.['ngc.simulationId']).toBe('sim_1')
  })

  it('reports an error with its exception attributes, and captures it', () => {
    const error = new Error('engine blew up')

    logger.error(error, { 'http.route': '/fin/eau' })

    const [message, line] = consoleCall('error') ?? []
    expect(message).toBe('engine blew up')
    expect(line).toMatchObject({
      'exception.type': 'Error',
      'exception.message': 'engine blew up',
    })
    // The capture is the logger's own: it cannot be called without its line,
    // and it reads it minus the rendering `$exception_list` carries on its own.
    expect(posthogCaptureException).toHaveBeenCalledWith(error, {
      'http.route': '/fin/eau',
    })
  })

  it('never captures a warned Error', () => {
    logger.warn(new Error('slow'))
    logger.error(new Error('reported'))

    expect(posthogCaptureException).toHaveBeenCalledTimes(1)
    expect(posthogCaptureException).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'reported' }),
      expect.anything()
    )
  })

  it('binds the scope for the body of `openSpan`, which has no span here', async () => {
    const result = await runInSpan(
      logger,
      'site.engine.safeEvaluate',
      (scoped) => {
        scoped.info('evaluating')

        return Promise.resolve(42)
      }
    )

    expect(result).toBe(42)
    expect(consoleLine()?.['ngc.scope']).toBe('site.engine.safeEvaluate')
  })

  it('has no span to annotate', () => {
    logger.setSpanAttribute('ngc.participantsCount', 12)

    expect(console.info).not.toHaveBeenCalled()
    expect(posthogLogger.info).not.toHaveBeenCalled()
  })

  it('calls the levels posthog-js itself exposes', async () => {
    // The mock above cannot catch a rename in a dependency bump: this reads the
    // real object, the way the server-side test reads a real pino line.
    const { default: realPosthog } = await vi.importActual<{
      default: { logger: PosthogLogger }
    }>('posthog-js')

    expect(Object.keys(realPosthog.logger)).toEqual(
      expect.arrayContaining(['debug', 'info', 'warn', 'error', 'fatal'])
    )
  })

  it('throws during the SSR pass of a client component', () => {
    vi.stubGlobal('window', undefined)

    let thrown: unknown
    try {
      clientLogger.error(new Error('engine blew up'))
    } catch (error) {
      thrown = error
    }

    // Thrown, not dropped: on the server this logger has no sink. The message
    // stays a stable sentence, and the attempted line rides along as a field.
    expect(thrown).toBeInstanceOf(BrowserLoggerOnServerError)
    expect(thrown).toMatchObject({ logMessage: 'engine blew up' })
    expect(console.error).not.toHaveBeenCalled()
    expect(posthogLogger.error).not.toHaveBeenCalled()
    expect(posthogCaptureException).not.toHaveBeenCalled()
  })

  it('carries the fields of an error as attributes, not in its message', () => {
    const failure = new BrowserLoggerOnServerError('engine blew up')

    logger.error(failure)

    expect(posthogLogger.error).toHaveBeenCalledWith(
      failure.message,
      expect.objectContaining({ 'ngc.logMessage': 'engine blew up' })
    )
  })

  it('keeps the console silent in production, where the line still exports', async () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://nosgestesclimat.fr')
    vi.resetModules()

    // `APP_ENV` is read once, where the module is evaluated: the import has to

    // come after the stub for the production branch to be the one under test.
    const { createBrowserLogger: inProduction } =
      await import('../logger.browser')

    inProduction({ verbosity: 'debug' }).warn('engine blew up')

    expect(console.warn).not.toHaveBeenCalled()
    expect(posthogLogger.warn).toHaveBeenCalled()
  })
})
