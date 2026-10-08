import type {
  LogLevel,
  LogMeta,
  OtelAttributes,
} from '@nosgestesclimat/core/features/logger/index'
import {
  logs,
  SeverityNumber,
  type Logger as ApiLogger,
} from '@opentelemetry/api-logs'

import { toLogAttributes } from './otlp-attributes.ts'
import { currentRequestIdentity } from './request-identity.ts'

const SEVERITY_NUMBER: Record<LogLevel, SeverityNumber> = {
  debug: SeverityNumber.DEBUG,
  info: SeverityNumber.INFO,
  warn: SeverityNumber.WARN,
  error: SeverityNumber.ERROR,
  fatal: SeverityNumber.FATAL,
}

const loggers = new Map<string, ApiLogger>()

/** Ships a line to OTel → PostHog. The active context provides trace ids.
 * No-op until a provider is registered (local dev / tests: stdout only). */
export function emitLogRecord({
  service,
  level,
  message,
  meta,
}: {
  service: string
  level: LogLevel
  message: string
  meta: LogMeta
}): void {
  // The OTel scope takes the qualified name of the emitting unit as it is
  // (`core.service.engineRegistry`); the service is on the resource. PostHog
  // renders a scope as `name@version`, which is why `ngc.scope` remains the
  // handle for exact filters.
  const declared = meta['ngc.scope']
  const scope = typeof declared === 'string' ? declared : service

  // `service` rides on the line but not in the attributes: the resource carries
  // it already, and a bare `service` next to `service.name` only invites a
  // filter that misses half the lines.
  const { service: _onTheLineOnly, ...attributes } = meta

  getLogger(scope).emit({
    body: message,
    severityNumber: SEVERITY_NUMBER[level],
    severityText: level,
    attributes: toLogAttributes({ ...attributes, ...identityAttributes() }),
  })
}

/** Resolved lazily by the API: caching a logger taken before init is safe. */
function getLogger(scope: string): ApiLogger {
  let logger = loggers.get(scope)

  if (!logger) {
    logger = logs.getLogger(scope)
    loggers.set(scope, logger)
  }

  return logger
}

/**
 * `posthogDistinctId` and `sessionId` are the attribute names PostHog matches
 * to link a line to a person and to a session recording, and its types check
 * the values we hand it.
 */
function identityAttributes(): Pick<
  OtelAttributes,
  'posthogDistinctId' | 'sessionId'
> {
  const identity = currentRequestIdentity()

  if (!identity) {
    return {}
  }

  return {
    ...(identity.distinctId && { posthogDistinctId: identity.distinctId }),
    ...(identity.sessionId && { sessionId: identity.sessionId }),
  }
}
