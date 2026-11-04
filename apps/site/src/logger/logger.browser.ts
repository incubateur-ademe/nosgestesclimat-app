import type {
  Logger,
  LogLevel,
  LogMeta,
  LogVerbosity,
} from '@nosgestesclimat/core/features/logger/index'
import { spanDecorator } from '@nosgestesclimat/core/features/logger/with-span'
import { ErrorWithCode } from '@nosgestesclimat/core/lib/errors'
import posthog, { type LogAttributes } from 'posthog-js'

import { APP_ENV } from '../env/app-env.ts'
import { publicEnv } from '../env/public'
import { toLogAttributes } from '../observability/otlp-attributes.ts'
import { isServerSide } from '../utils/nextjs/isServerSide'
import { captureProperties, prefixKeys, shapeLine, shouldCapture } from './line'

/**
 * The SSR pass runs a client component in the server process, where this logger
 * has no sink: the layer mistake is thrown rather than dropped.
 */
export class BrowserLoggerOnServerError extends ErrorWithCode<'browser_logger_on_server'> {
  /** The line the caller tried to write. A field, not a message: Error Tracking
   * groups on the message, and one issue per attempted line is not an issue. */
  public readonly logMessage: string

  constructor(logMessage: string) {
    super(
      'browser_logger_on_server',
      'Browser logger called during server rendering: use the server logger'
    )
    this.logMessage = logMessage
  }
}

/**
 * Where each level writes on the console. `fatal` borrows `error`: the browser
 * console has no such level.
 */
const CONSOLE_METHOD: Record<LogLevel, 'debug' | 'info' | 'warn' | 'error'> = {
  debug: 'debug',
  info: 'info',
  warn: 'warn',
  error: 'error',
  fatal: 'error',
}

/** pino's own ordering, so one `NEXT_PUBLIC_LOG_VERBOSITY` reads the same on both
 * runtimes. */
const RANK: Record<LogLevel, number> = {
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  fatal: 60,
}

/** Sends a failure to Error Tracking with its line. Inside the logger so
 * nothing reports without a line. */
function capture(error: Error, line: LogMeta): void {
  posthog.captureException(error, line)
}

/**
 * Local dev sees everything; a deployed build keeps `warn` and above — the
 * browser multiplies the volume by the number of visitors.
 */
const DEFAULT_LEVEL: LogLevel = APP_ENV === 'development' ? 'debug' : 'warn'

/** Browser logger: console + PostHog Logs. No spans (no OTel SDK in the
 * browser); `withSpan` binds the scope only. Correlation via posthog-js's own
 * `distinctId`/`sessionId`, not a trace id from here. The capture is the
 * logger's own — nothing reports on the side. */
export function createBrowserLogger({
  service = 'browser',
  verbosity = publicEnv.NEXT_PUBLIC_LOG_VERBOSITY ?? DEFAULT_LEVEL,
}: {
  service?: string
  verbosity?: LogVerbosity
} = {}): Logger {
  const threshold = verbosity === 'silent' ? Infinity : RANK[verbosity]

  /** Console (dev/review/preprod) + PostHog Logs. posthog-js merges its own
   * context (`distinctId`, `sessionId`) — never re-add those keys here. */
  const emit = (level: LogLevel, message: string, shaped: LogMeta): void => {
    // The console is for whoever is looking, which is dev, review and preprod.
    // Production has nobody in it, and the line reaches PostHog Logs anyway.
    if (APP_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console[CONSOLE_METHOD[level]](message, { service, ...shaped })
    }

    posthog.logger[level](
      message,
      // OTLP's value union carries a `Uint8Array`, which posthog-js does not
      // declare: `toLogAttributes` never returns one, so the cast closes a
      // gap on paper only.
      toLogAttributes(shaped) as LogAttributes
    )
  }

  const build = (bindings: LogMeta): Logger => {
    const write = (
      level: LogLevel,
      message: string,
      meta?: LogMeta,
      error?: Error
    ) => {
      if (isServerSide()) {
        throw new BrowserLoggerOnServerError(message)
      }

      // The level filters both sinks, as it filters stdout and the export on
      // the server: a line the console drops must not reach PostHog either.
      if (RANK[level] < threshold) {
        return
      }

      // The one shape both sinks see: `meta` carries attributes only, a
      // caught `Error` goes in the first argument of `warn`/`error` and gets
      // its `exception.*` attributes from there.
      const shaped = shapeLine({ bindings, meta, error })

      emit(level, message, shaped)

      // Only an `Error` is worth reporting: a message alone carries no stack.
      // The capture takes the line with it, as it does on the server.
      if (shouldCapture(level) && error) {
        capture(error, captureProperties(shaped))
      }
    }

    const child = (more: LogMeta) => build({ ...bindings, ...prefixKeys(more) })

    return {
      child,
      // No span opens and none closes: the body gets the logger bound to the
      // scope and to what names the operation, and its own `finally` stays its
      // business.
      withSpan: spanDecorator(
        async (scope, run, picked) => await run(child({ ...picked, scope }))
      ),
      // Nothing to annotate: the line carries what the server would put on a
      // span, through the bindings and the meta.
      setSpanAttribute: () => undefined,
      debug: (message, meta) => write('debug', message, meta),
      info: (message, meta) => write('info', message, meta),
      // The union is the implementation's business: callers see the two
      // overloads, and only one of them carries an `Error`.
      warn: (message: string | Error, meta?: LogMeta) =>
        message instanceof Error
          ? write('warn', message.message, meta, message)
          : write('warn', message, meta),
      error: (error, meta) => write('error', error.message, meta, error),
      fatal: (error, meta) => write('fatal', error.message, meta, error),
    }
  }

  return build({})
}

/** Browser composition root. One composition, unlike the Node side which has
 * two sharing `logger.node.ts`. */
const browserLogger = createBrowserLogger()

export default browserLogger
