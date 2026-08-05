import { maskEmail, truncateUserId } from '@nosgestesclimat/core/lib/pii'
import winston from 'winston'
import SentryTransport from 'winston-transport-sentry-node'
import { config } from './config.ts'

export { maskEmail, truncateUserId }

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
