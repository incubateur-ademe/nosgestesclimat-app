import { toAttributeKey } from '@nosgestesclimat/core/features/logger/attribute-key'
import type {
  Logger,
  LogLevel,
  LogMeta,
  LogOptions,
  ScopeName,
} from '@nosgestesclimat/core/features/logger/index'
import { toError } from '@nosgestesclimat/core/lib/to-error'
import { context, SpanStatusCode, trace } from '@opentelemetry/api'
import pino, { type Logger as PinoLogger } from 'pino'

import { emitLogRecord } from './observability/log-bridge.ts'
import {
  errorAttributes,
  exceptionAttributes,
  flattenMeta,
} from './observability/log-shape.ts'
import { appTracer } from './observability/setup.ts'

/**
 * Puts our attributes under the `ngc.` prefix, and leaves the ones another
 * party named as they are — see `toAttributeKey`. Applied where the line is
 * built, so the drain and the export carry the same names.
 */
function prefixKeys(meta: LogMeta): LogMeta {
  const prefixed: LogMeta = {}

  for (const [key, value] of Object.entries(meta)) {
    prefixed[toAttributeKey(key)] = value
  }

  return prefixed
}

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

/** The default: nothing to let through — the worker and the tests have no
 * framework control flow to protect. */
const noControlFlow = (): void => undefined

export function createLogger({
  service,
  level = (process.env.LOG_LEVEL ?? 'info') as LogLevel,
  pretty = process.env.LOG_PRETTY === 'true',
  onCapture,
  rethrowControlFlow = noControlFlow,
}: {
  service: string
  level?: LogLevel
  pretty?: boolean
  /** Receives the original `Error`: Sentry needs its prototype and stack. */
  onCapture: (error: Error) => void
  /**
   * Called on a failure before the span is marked. Next injects
   * `unstable_rethrow` here: a redirect or a `notFound()` is control flow, not
   * a failed operation. The worker, which has no such errors, injects nothing.
   */
  rethrowControlFlow?: (error: unknown) => void
}): Logger {
  /**
   * Single-line JSON output: a multi-line pretty-printed object gets fragmented
   * by Scalingo's log drain into separate timestamped lines, which then
   * interleave with other concurrent log calls and read as scrambled. Pino
   * always writes one line per log call, so the pretty transport stays opt-in
   * and local-only.
   *
   * Field names (`timestamp`, `level` as a label, `message`, `service`) mirror
   * apps/server's winston setup so both apps read identically in the drain.
   */
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
            timestampKey: 'timestamp',
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
      options?: LogOptions,
      error?: Error
    ) => {
      // The level filters both outputs: a line pino drops from stdout must not
      // reach PostHog either, or `LOG_LEVEL` stops being the volume lever.
      if (!instance.isLevelEnabled(level)) {
        return
      }

      // The meta is a bag of attributes: an `Error` belongs in the message of
      // `warn`/`error`, not inside it.
      const line: LogMeta = prefixKeys({
        ...meta,
        ...(error && exceptionAttributes(error)),
      })

      // The shape both outputs see: the bindings pino would merge anyway, the
      // meta, and the fields an error class carries — flattened here, once.
      const shaped = flattenMeta({ ...instance.bindings(), ...line })

      instance[level](shaped, message)
      // The same line goes to PostHog: the bridge maps its values to OTLP
      // attributes, which is all that is left to do.
      emitLogRecord({ service, level, message, meta: shaped })

      const capture =
        options?.capture ?? (level === 'error' || level === 'fatal')

      // Only an `Error` is worth reporting: a message alone carries no stack.
      if (capture && error) {
        onCapture(error)
      }
    }

    return {
      child: (bindings) => build(instance.child(prefixKeys(bindings))),
      withSpan: async <Result>(
        scope: ScopeName,
        run: (logger: Logger) => Promise<Result>
      ): Promise<Result> =>
        await appTracer().startActiveSpan(scope, async (span) => {
          try {
            return await run(build(instance.child(prefixKeys({ scope }))))
          } catch (error) {
            // Before anything else: a control-flow error must leave the span
            // untouched, or every redirect reads as a failure.
            rethrowControlFlow(error)

            const failure = toError(error)

            // What the semantic conventions ask of a span whose operation
            // failed: the exception as an event, its class as `error.type`
            // (plus what our error classes carry), the message as the status
            // description. The report itself stays the caller's decision.
            span.recordException(failure)
            span.setAttributes(errorAttributes(failure))
            span.setStatus({
              code: SpanStatusCode.ERROR,
              message: failure.message,
            })
            throw error
          } finally {
            span.end()
          }
        }),
      debug: (message, meta) => write('debug', message, meta),
      info: (message, meta) => write('info', message, meta),
      // The union is the implementation's business: callers see the two
      // overloads, and only the `Error` one accepts options.
      warn: (message: string | Error, meta?: LogMeta, options?: LogOptions) =>
        message instanceof Error
          ? write('warn', message.message, meta, options, message)
          : write('warn', message, meta, options),
      error: (error, meta, options) =>
        write('error', error.message, meta, options, error),
      fatal: (error, meta, options) =>
        write('fatal', error.message, meta, options, error),
    }
  }

  return build(pinoLogger)
}
