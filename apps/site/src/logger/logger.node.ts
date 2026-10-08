/** Node `Logger` port: pino → stdout, OTLP → PostHog, Sentry via injected
 * capture. Wired by `logger.server.ts` (site) and `worker/observability.ts`. */
import { toAttributeKey } from '@nosgestesclimat/core/features/logger/attribute-key'
import type {
  Logger,
  LogLevel,
  LogMeta,
  ScopeName,
} from '@nosgestesclimat/core/features/logger/index'
import { toError } from '@nosgestesclimat/core/lib/to-error'
import { context, SpanStatusCode, trace } from '@opentelemetry/api'
import pino, { type Logger as PinoLogger } from 'pino'

import { emitLogRecord } from '../observability/log-bridge.ts'
import { toSpanAttributes } from '../observability/otlp-attributes.ts'
import { appTracer } from '../observability/setup.ts'
import {
  captureProperties,
  exceptionAttributes,
  flattenMeta,
  prefixKeys,
  shapeLine,
  shouldCapture,
} from './line.ts'

/**
 * Attaches the active span's ids: that is what makes a line findable from its
 * trace, and the trace from its lines. Empty outside a span (startup, tests).
 */
function traceContext(): LogMeta {
  const spanContext = trace.getSpan(context.active())?.spanContext()

  return spanContext
    ? { trace_id: spanContext.traceId, span_id: spanContext.spanId }
    : {}
}

/**
 * Default for `rethrowControlFlow`: the worker and the tests have no framework
 * control flow to protect.
 */
const noControlFlow = (): void => undefined

export function createLogger({
  service,
  level = 'info',
  pretty = false,
  onCapture,
  rethrowControlFlow = noControlFlow,
}: {
  service: string
  /** The root hands over the validated one: `env/server.ts` on the site, its
   * own environment in the worker. */
  level?: LogLevel
  pretty?: boolean
  /**
   * Receives the original `Error` — Sentry needs its prototype and its stack —
   * and the line it was reported with, so a reader of the issue gets the same
   * attributes as a reader of the trace.
   */
  onCapture: (error: Error, line: LogMeta) => void
  /**
   * Called on a failure before the span is marked. Next injects
   * `unstable_rethrow` here: a redirect or a `notFound()` is control flow, not
   * a failed operation. The worker, which has no such errors, injects nothing.
   */
  rethrowControlFlow?: (error: unknown) => void
}): Logger {
  /** One JSON line per call: Scalingo's drain fragments multi-line objects.
   * Field names are pino's own; apps/server (legacy winston) keeps its shape. */
  const pinoLogger = pino({
    level,
    base: { service },
    timestamp: pino.stdTimeFunctions.isoTime,
    messageKey: 'message',
    mixin: traceContext,
    transport: pretty
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            messageKey: 'message',
            translateTime: 'HH:MM:ss',
          },
        }
      : undefined,
  })

  const build = (instance: PinoLogger): Logger => {
    const write = (
      level: LogLevel,
      message: string,
      meta?: LogMeta,
      error?: Error
    ) => {
      // The level filters both outputs: a line pino drops from stdout must not
      // reach PostHog either, or `LOG_LEVEL` stops being the volume lever.
      if (!instance.isLevelEnabled(level)) {
        return
      }

      // The one shape both outputs see, built where the line is: `meta` carries
      // attributes only, a caught `Error` goes in the first argument of
      // `warn`/`error` and gets its `exception.*` attributes from there.
      const shaped = shapeLine({ bindings: instance.bindings(), meta, error })

      instance[level](shaped, message)
      // The same shaped line goes to PostHog: the bridge only maps it to OTLP
      // attributes.
      emitLogRecord({ service, level, message, meta: shaped })

      // Only an `Error` is worth reporting: a message alone carries no stack.
      // The capture takes the line with it, minus what `$exception_list`
      // renders on its own: an issue does not need the message twice.
      if (shouldCapture(level) && error) {
        onCapture(error, captureProperties(shaped))
      }
    }

    async function withSpan<Result>(
      scope: ScopeName,
      run: (logger: Logger) => Promise<Result>
    ): Promise<Result> {
      // The span carries the logger's own context, so a `child(...)` chain
      // reaches the trace as it reaches the lines. Two keys are dropped:
      // `scope` names each span, and a nested one would inherit its parent's;
      // `service` is pino's base field, and the resource already carries it as
      // `service.name` — the log export drops it for the same reason.
      const {
        [toAttributeKey('scope')]: _scope,
        service: _service,
        ...inherited
      } = instance.bindings()

      return await appTracer().startActiveSpan(scope, async (span) => {
        span.setAttributes(toSpanAttributes(flattenMeta(inherited)))

        try {
          return await run(build(instance.child(prefixKeys({ scope }))))
        } catch (error) {
          // Before anything else: a control-flow error must leave the span
          // untouched, or every redirect reads as a failure.
          rethrowControlFlow(error)

          const failure = toError(error)

          // A failed operation, as far as the span can say it: the exception
          // as an event (the semantic conventions' own place for it) and as
          // attributes — PostHog ingests span attributes and drops events, so
          // without them a failed trace shows the status and not the cause.
          // The report itself stays the caller's decision.
          span.recordException(failure)
          span.setAttributes(toSpanAttributes(exceptionAttributes(failure)))
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: failure.message,
          })
          throw error
        } finally {
          span.end()
        }
      })
    }

    return {
      child: (bindings) => build(instance.child(prefixKeys(bindings))),
      withSpan,
      // Shaped like a binding, so the attribute reads the same as the ones the
      // span inherited; only the destination differs.
      setSpanAttribute: (key, value) =>
        trace
          .getActiveSpan()
          ?.setAttributes(toSpanAttributes(prefixKeys({ [key]: value }))),
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

  return build(pinoLogger)
}
