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

import { toLogAttributes } from './log-shape.ts'
import { currentRequestIdentity } from './request-identity.ts'

const SEVERITY_NUMBER: Record<LogLevel, SeverityNumber> = {
  debug: SeverityNumber.DEBUG,
  info: SeverityNumber.INFO,
  warn: SeverityNumber.WARN,
  error: SeverityNumber.ERROR,
  fatal: SeverityNumber.FATAL,
}

const loggers = new Map<string, ApiLogger>()

/**
 * Ships a line to the OpenTelemetry pipeline, which exports it to PostHog. The
 * active context gives the record its trace ids, so a line stays reachable from
 * the trace it belongs to.
 *
 * A no-op until a `LoggerProvider` is registered: stdout remains the only
 * output in local dev and tests.
 */
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
  // The scope attribute already carries the qualified name of the emitting unit
  // (`core.service.engineRegistry`), and the service is on the resource: the OTel
  // scope takes it as is. PostHog renders a scope as `name@version`, which is why
  // `ngc.scope` stays the handle for exact filters.
  const declared = meta['ngc.scope']
  const scope = typeof declared === 'string' ? declared : service

  // `service` is on the line — it mirrors the winston setup — but not in the
  // attributes: the resource already carries it, and a bare `service` next to
  // `service.name` only invites a filter that misses half the lines.
  const { service: _onTheLineOnly, ...attributes } = meta

  getLogger(scope).emit({
    body: message,
    severityNumber: SEVERITY_NUMBER[level],
    severityText: level,
    attributes: toLogAttributes({ ...attributes, ...identityAttributes() }),
  })
}

/** Resolved lazily by the API, so caching a logger taken before init is safe. */
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
