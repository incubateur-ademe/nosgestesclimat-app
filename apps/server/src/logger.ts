import winston from 'winston'
import SentryTransport from 'winston-transport-sentry-node'
import { config } from './config.js'

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
  }

  return body
}

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL ?? 'info',
  defaultMeta: {
    service: 'server',
  },
  format: combine(timestamp(), json(), errors({ stack: true })),
  transports,
})

export default logger
