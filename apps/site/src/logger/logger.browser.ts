import type {
  Logger,
  LogLevel,
  LogMeta,
  ScopeName,
} from '@nosgestesclimat/core/features/logger/index'
import { captureException } from '@sentry/nextjs'
import posthog, { type LogAttributes } from 'posthog-js'

import { APP_ENV } from '../env/app-env.ts'
import { publicEnv } from '../env/public'
import { toLogAttributes } from '../observability/otlp-attributes.ts'
import { isServerSide } from '../utils/nextjs/isServerSide'
import { captureProperties, prefixKeys, shapeLine, shouldCapture } from './line'

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

/** pino's own ordering, so one `LOG_LEVEL` reads the same on both runtimes. */
const RANK: Record<LogLevel, number> = {
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  fatal: 60,
}

/** Sends a failure to both sinks with its line. Inside the logger so nothing
 * reports without a line. */
function capture(error: Error, line: LogMeta): void {
  captureException(error, { extra: line })
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
  level = publicEnv.NEXT_PUBLIC_LOG_LEVEL ?? DEFAULT_LEVEL,
}: {
  service?: string
  level?: LogLevel
} = {}): Logger {
  const threshold = RANK[level]

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
      // The browser logger exists in the browser: during the SSR pass of a
      // client component it is inert — no line, no capture. The pass replays
      // at hydration, where both happen, once; a failure that crashes the
      // server render is `onRequestError`'s. Code that must log while it runs
      // on the server belongs to the server logger.
      if (isServerSide()) {
        // The mistake is easy to make — a log in a render body — and silent
        // in production, so local dev says it out loud.
        if (APP_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.warn(
            `[ngc] browser logger called during server rendering, line dropped: "${message}"`
          )
        }

        return
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

    async function withSpan<Result>(
      scope: ScopeName,
      run: (logger: Logger) => Promise<Result>
    ): Promise<Result> {
      // No span opens and none closes: the body gets the logger bound to the
      // scope, and its own `finally` stays its business.
      return await run(build({ ...bindings, ...prefixKeys({ scope }) }))
    }

    return {
      child: (more) => build({ ...bindings, ...prefixKeys(more) }),
      withSpan,
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
