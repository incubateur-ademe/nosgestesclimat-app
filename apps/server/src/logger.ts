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

export const truncateUserId = (userId: unknown) =>
  typeof userId === 'string'
    ? `${userId.slice(0, 8)}***`
    : '[REDACTED]'

export const redactBody = <T = unknown>(body: T) => {
  if (typeof body === 'object' && !!body) {
    if ('actionChoices' in body) {
      body.actionChoices = '[REDACTED]'
    }
    if ('additionalQuestionsAnswers' in body) {
      body.additionalQuestionsAnswers = '[REDACTED]'
    }
    if ('computedResults' in body) {
      body.computedResults = '[REDACTED]'
    }
    if ('extendedSituation' in body) {
      body.extendedSituation = '[REDACTED]'
    }
    if ('foldedSteps' in body) {
      body.foldedSteps = '[REDACTED]'
    }
    if ('situation' in body) {
      body.situation = '[REDACTED]'
    }
    // Auth payloads must never land verbatim in access logs: the email is PII
    // and the verification code is a valid credential for that email.
    if ('email' in body) {
      body.email = maskEmail(body.email)
    }
    if ('code' in body) {
      body.code = '[REDACTED]'
    }
    if ('userId' in body) {
      body.userId = truncateUserId(body.userId)
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

export default logger
