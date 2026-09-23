import type { Logger as CoreLogger } from '@nosgestesclimat/core/features/logger/index'
import winston from 'winston'
import SentryTransport from 'winston-transport-sentry-node'
import { config } from './config.ts'

const { combine, timestamp, json, errors } = winston.format

const transports: winston.transport[] = [new winston.transports.Console()]

if (config.thirdParty.sentry.dsn) {
  transports.push(
    new SentryTransport.default({
      sentry: {
        dsn: config.thirdParty.sentry.dsn,
        tracesSampleRate: 0.1,
        sampleRate: 0.1,
        debug: false,
      },
      level: 'error',
    })
  )
}

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
 * Keeps a log line correlatable with a user report without storing the address:
 * `jo***@ex***.com` is enough to match an email a user gives us in support.
 */
export const maskEmail = (email: unknown) => {
  if (typeof email !== 'string') {
    return '[REDACTED]'
  }

  const [local, domain] = email.split('@')

  return domain
    ? `${local.slice(0, 2)}***@${domain.slice(0, 2)}***`
    : '[REDACTED]'
}

/**
 * Flattens an error into log metadata. `message` and `stack` are picked up by
 * winston (and forwarded to Sentry) while the rest of the metadata is kept.
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
  transports,
})

/**
 * The core services take the `Logger` interface of the app: this adapts the
 * winston instance to it, so the legacy server keeps compiling — and keeps its
 * own log shape — until it is migrated.
 */
const toCoreLogger = (winstonLogger: winston.Logger): CoreLogger => ({
  child: (bindings) => toCoreLogger(winstonLogger.child(bindings)),
  // The legacy server has no tracer: the span is a no-op and the callback gets
  // the scope-bound logger, which is what a `withChildSpan` call site uses it
  // for.
  withChildSpan: (scope, run) =>
    run(toCoreLogger(winstonLogger.child({ scope }))),
  debug: (message, meta) => winstonLogger.debug(message, meta),
  info: (message, meta) => winstonLogger.info(message, meta),
  warn: (message, meta) =>
    winstonLogger.warn(message instanceof Error ? message.message : message, {
      ...meta,
      ...(message instanceof Error ? errorMeta(message) : {}),
    }),
  error: (error, meta) =>
    winstonLogger.error(error.message, { ...meta, ...errorMeta(error) }),
  // winston has no `fatal` level: the flag keeps the distinction readable.
  fatal: (error, meta) =>
    winstonLogger.error(error.message, {
      ...meta,
      ...errorMeta(error),
      fatal: true,
    }),
})

export const coreLogger = toCoreLogger(logger)

export default logger
