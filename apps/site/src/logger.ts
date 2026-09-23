import { toAttributeKey } from '@nosgestesclimat/core/features/logger/attribute-key'
import type {
  LogLevel,
  LogMeta,
  LogOptions,
  Logger,
} from '@nosgestesclimat/core/features/logger/index'
import { context, trace } from '@opentelemetry/api'
import pino, { type Logger as PinoLogger } from 'pino'

import { exceptionAttributes } from './observability/log-attributes.ts'
import { emitLogRecord } from './observability/log-bridge.ts'

/** Keys redacted before export, as a backstop: callers must not log them at all. */
/**
 * Keys redacted before export, as a backstop: callers must not log them at
 * all. The bracketed ones are the names on the line, prefixed by the factory —
 * pino reads a dot as a path separator, so `'ngc.email'` would look for
 * `email` inside a `ngc` object and match nothing. The wildcards cover a
 * payload object handed over as is.
 */
const REDACTED_PATHS = [
  '["ngc.email"]',
  '["ngc.password"]',
  '["ngc.token"]',
  '["ngc.cookie"]',
  '*.email',
  '*.password',
  '*.token',
  '*.cookie',
]

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

export function createLogger({
  service,
  level = (process.env.LOG_LEVEL ?? 'info') as LogLevel,
  pretty = process.env.LOG_PRETTY === 'true',
  onCapture,
}: {
  service: string
  level?: LogLevel
  pretty?: boolean
  /** Receives the original `Error`: Sentry needs its prototype and stack. */
  onCapture: (error: Error) => void
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
    redact: { paths: REDACTED_PATHS, censor: '[redacted]' },
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

      instance[level](line, message)
      // The same line goes to PostHog, with the bindings pino keeps apart from
      // the meta — its own `bindings()` walks the `child` chain.
      emitLogRecord({
        service,
        level,
        message,
        meta: { ...instance.bindings(), ...line },
      })

      const capture =
        options?.capture ?? (level === 'error' || level === 'fatal')

      // Only an `Error` is worth reporting: a message alone carries no stack.
      if (capture && error) {
        onCapture(error)
      }
    }

    return {
      child: (bindings) => build(instance.child(prefixKeys(bindings))),
      debug: (message, meta) => write('debug', message, meta),
      info: (message, meta) => write('info', message, meta),
      warn: (message, meta, options) =>
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
