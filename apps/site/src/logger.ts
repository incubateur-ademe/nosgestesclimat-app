import type {
  LogLevel,
  LogMeta,
  LogOptions,
  Logger,
} from '@nosgestesclimat/core/features/logger/index'
import pino, { type Logger as PinoLogger } from 'pino'

/** Keys redacted before export, as a backstop: callers must not log them at all. */
const REDACTED_PATHS = [
  'email',
  '*.email',
  'password',
  '*.password',
  'token',
  '*.token',
  'cookie',
  '*.cookie',
]

/** OTel names for the exception a log record carries. */
const EXCEPTION_TYPE = 'exception.type'
const EXCEPTION_MESSAGE = 'exception.message'
const EXCEPTION_STACKTRACE = 'exception.stacktrace'

/** Beyond this, a nested object is kept as is: the line stays readable. */
const MAX_META_DEPTH = 4

/**
 * OTel attributes are flat: `engine.key` reads, filters and charts, while
 * `engine: { key }` becomes a blob PostHog cannot query. Dots are the separator
 * the semantic conventions themselves use (`http.request.method`).
 */
function flattenMeta(meta: LogMeta, prefix = '', depth = 0): LogMeta {
  const flat: LogMeta = {}

  for (const [key, value] of Object.entries(meta)) {
    const name = `${prefix}${key}`

    if (value instanceof Error) {
      Object.assign(
        flat,
        flattenMeta(exceptionAttributes(value), `${name}.`, depth)
      )
      continue
    }

    if (isPlainObject(value) && depth < MAX_META_DEPTH) {
      Object.assign(flat, flattenMeta(value, `${name}.`, depth + 1))
      continue
    }

    flat[name] = value
  }

  return flat
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false
  }

  const prototype = Object.getPrototypeOf(value)

  return prototype === Object.prototype || prototype === null
}

/**
 * The exception as its own attributes: the three names OTel defines for a log
 * record (`exception.type`, `exception.message`, `exception.stacktrace`, the
 * cause chain appended), plus whatever the error class carries — `code` for a
 * `DomainError`, the business `payload` for an `Exception`. `toJSON()` is not
 * used: it only keeps `code` for `ErrorWithCode`.
 */
function exceptionAttributes(error: Error): LogMeta {
  const attributes: LogMeta = {
    [EXCEPTION_TYPE]: error.name,
    [EXCEPTION_MESSAGE]: error.message,
    [EXCEPTION_STACKTRACE]: stackTrace(error),
  }

  for (const [key, value] of Object.entries(error)) {
    // `name` is `exception.type`; `level` would collide with pino's own level.
    if (key === 'name' || key === 'message') {
      continue
    }

    attributes[key === 'level' ? 'level.domain' : key] = value
  }

  return attributes
}

/** V8 keeps the stack out of the enumerable properties: it is read here. */
function stackTrace(error: Error): string {
  const frames: string[] = []
  let current: unknown = error

  for (let depth = 0; current instanceof Error && depth < 5; depth++) {
    const label = depth === 0 ? '' : 'Caused by: '
    frames.push(
      `${label}${current.stack ?? `${current.name}: ${current.message}`}`
    )
    current = current.cause
  }

  return frames.join('\n')
}

const writers: Record<
  LogLevel,
  (logger: PinoLogger, meta: LogMeta, message: string) => void
> = {
  debug: (logger, meta, message) => logger.debug(meta, message),
  info: (logger, meta, message) => logger.info(meta, message),
  warn: (logger, meta, message) => logger.warn(meta, message),
  error: (logger, meta, message) => logger.error(meta, message),
  fatal: (logger, meta, message) => logger.fatal(meta, message),
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
      pinoLevel: LogLevel,
      message: string,
      meta: LogMeta | undefined,
      options: LogOptions | undefined,
      error?: Error
    ) => {
      // The meta is a flat bag of attributes: an `Error` belongs in the
      // message of `warn`/`error`, not inside it.
      const line: LogMeta = flattenMeta({
        ...meta,
        ...(error && exceptionAttributes(error)),
      })

      writers[pinoLevel](instance, line, message)

      const capture =
        options?.capture ?? (pinoLevel === 'error' || pinoLevel === 'fatal')

      // Only an `Error` is worth reporting: a message alone carries no stack.
      if (capture && error) {
        onCapture(error)
      }
    }

    return {
      child: (bindings) => build(instance.child(bindings)),
      debug: (message, meta) => write('debug', message, meta, undefined),
      info: (message, meta) => write('info', message, meta, undefined),
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
