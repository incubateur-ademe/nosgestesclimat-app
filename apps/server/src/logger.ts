import type { Logger as CoreLogger } from '@nosgestesclimat/core/features/logger/index'
import { spanDecorator } from '@nosgestesclimat/core/features/logger/with-span'
import winston from 'winston'

const { combine, timestamp, json, errors } = winston.format

export const redactBody = <T = unknown>(body: T) => {
  if (typeof body === 'object' && !!body) {
    if ('additionalQuestionsAnswers' in body) {
      body.additionalQuestionsAnswers = '[REDACTED]'
    }
    if ('computedResults' in body) {
      body.computedResults = '[REDACTED]'
    }
    if ('foldedSteps' in body) {
      body.foldedSteps = '[REDACTED]'
    }
    if ('situation' in body) {
      body.situation = '[REDACTED]'
    }
  }

  return body
}

/**
 * Flattens an error into log metadata. `message` and `stack` are picked up by
 * winston while the rest of the metadata is kept.
 */
export const errorMeta = (err: unknown) =>
  err instanceof Error
    ? { name: err.name, message: err.message, stack: err.stack }
    : { message: String(err) }

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL ?? 'info',
  defaultMeta: {
    service: 'server',
  },
  format: combine(timestamp(), json(), errors({ stack: true })),
  transports: [new winston.transports.Console()],
})

/**
 * Adapts the winston instance to the core `Logger` interface, so the legacy
 * server keeps compiling — and keeps its own log shape — until it is migrated.
 */
const toCoreLogger = (winstonLogger: winston.Logger): CoreLogger => ({
  child: (bindings) => toCoreLogger(winstonLogger.child(bindings)),
  // No tracer in the legacy server: the span is a no-op, and the callback gets
  // the logger bound to the scope and to what names the operation.
  withSpan: spanDecorator((scope, run, bindings) =>
    run(toCoreLogger(winstonLogger.child({ ...bindings, scope })))
  ),
  // No tracer either: there is no span to annotate.
  setSpanAttribute: () => undefined,
  debug: (message, meta) => winstonLogger.debug(message, meta),
  info: (message, meta) => winstonLogger.info(message, meta),
  warn: (message, meta) =>
    winstonLogger.warn(message instanceof Error ? message.message : message, {
      ...meta,
      ...(message instanceof Error ? errorMeta(message) : {}),
    }),
  error: (error, meta) =>
    winstonLogger.error(error.message, { ...meta, ...errorMeta(error) }),
  // winston has no `fatal` level, so the flag in the metadata keeps the
  // distinction readable.
  fatal: (error, meta) =>
    winstonLogger.error(error.message, {
      ...meta,
      ...errorMeta(error),
      fatal: true,
    }),
})

export const coreLogger = toCoreLogger(logger)

export default logger
