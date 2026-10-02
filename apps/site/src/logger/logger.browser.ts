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

/**
 * The two sinks of a captured failure, both given the error and the line it was
 * reported with: Sentry for the prototype, the stack and its release until it
 * is removed, PostHog Error Tracking for the issue and the volume. It lives
 * inside the logger, so a failure cannot be reported without its line — the two
 * go out together or not at all, and an issue names its scope, its route, its
 * digest.
 *
 * Browser-only by construction: `write` returns before reaching it outside the
 * browser, which is why nothing here checks for the server again.
 */
function capture(error: Error, line: LogMeta): void {
  captureException(error, { extra: line })
  posthog.captureException(error, line)
}

/**
 * Local dev sees everything; a deployed build keeps `warn` and above — the
 * browser multiplies the volume by the number of visitors.
 */
const DEFAULT_LEVEL: LogLevel = APP_ENV === 'development' ? 'debug' : 'warn'

/**
 * The browser logger: the server's port and the server's line, with the sinks a
 * browser has — the console, for whoever is looking, and `posthog.logger`, which
 * lands in the same PostHog Logs instance as `web-server` and `worker` (see
 * `logs.serviceName` in `Posthog.ts`).
 *
 * Two things this runtime cannot carry:
 *
 * - **No spans**: nothing ships an OTel SDK to the browser and Sentry
 *   Performance is retired, so `withSpan` binds the scope and runs the body,
 *   `setSpanAttribute` does nothing. The port stays whole, and a call site
 *   reads the same on both runtimes.
 * - **No `trace_id`**: the correlation goes the other way. posthog-js stamps
 *   `posthogDistinctId`/`sessionId` on every record it sends — the pair the
 *   server attaches per request — so one session reads front and back as one.
 *
 * The capture is the logger's own (`capture` below): no injection point, so
 * nothing in the app can report a failure on the side, without its line.
 */
export function createBrowserLogger({
  service = 'browser',
  level = publicEnv.NEXT_PUBLIC_LOG_LEVEL ?? DEFAULT_LEVEL,
}: {
  service?: string
  level?: LogLevel
} = {}): Logger {
  const threshold = RANK[level]

  /**
   * The two sinks of a line. The console is this runtime's stdout without the
   * drain: nothing parses it, so the line goes out as an object devtools can
   * expand, and the attributes are the exported ones — a value read here is
   * also a PostHog search. `service` tells these lines from the server's in
   * `next dev`, where both print to the same terminal; it stays out of the
   * export, where the resource carries `service.name` (`logs.serviceName`).
   *
   * posthog-js merges its own context into every record —
   * `posthogDistinctId`, `sessionId`, `url.full`, the active feature flags —
   * so the line carries its request without this logger naming any of it, and
   * our attributes win the merge: never re-add those keys here. A no-op until
   * `posthog.init` ran — no key, or consent refused: the SDK falls back on its
   * own noop logger, and its queue drops what opt-out withholds.
   */
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

/**
 * Browser composition root: the console and PostHog Logs for the lines, and the
 * logger's own capture for the failures. The root sits with the implementation:
 * the browser has one composition, where the Node side has two sharing
 * `logger.node.ts`.
 */
const browserLogger = createBrowserLogger()

export default browserLogger
