import { toAttributeKey } from '@nosgestesclimat/core/features/logger/attribute-key'
import type {
  LogLevel,
  LogMeta,
} from '@nosgestesclimat/core/features/logger/index'
import { ErrorWithCode } from '@nosgestesclimat/core/lib/errors'

/** OTel names for the exception a log record carries. Exported: the capture
 * keeps the same two out of the line, which `$exception_list` renders itself. */
export const EXCEPTION_TYPE = 'exception.type'
export const EXCEPTION_MESSAGE = 'exception.message'

/** The semconv name for the class of error, where our `code` goes. */
const ERROR_TYPE = 'error.type'

/** Keys rendered by the capture or their own attributes: skipped here so they
 * don't appear twice. */
const RENDERED_ERROR_KEYS = new Set(['name', 'message', 'cause', 'stack'])

/** Deeper objects are written as JSON text: an attribute beyond this depth is
 * not queryable anyway. */
const MAX_ATTRIBUTE_DEPTH = 4

/** Prefixes our keys with `ngc.`; leaves external names as-is. */
export function prefixKeys(meta: LogMeta): LogMeta {
  const prefixed: LogMeta = {}

  for (const [key, value] of Object.entries(meta)) {
    prefixed[toAttributeKey(key)] = value
  }

  return prefixed
}

/** Flattens meta into dotted keys (`engine.key`). Dots match semconv and
 * PostHog queries. Done once where the line is built. */
export function flattenMeta(meta: LogMeta, prefix = '', depth = 0): LogMeta {
  const flat: LogMeta = {}

  for (const [key, value] of Object.entries(meta)) {
    const name = `${prefix}${key}`

    if (isPlainObject(value) && depth < MAX_ATTRIBUTE_DEPTH) {
      Object.assign(flat, flattenMeta(value, `${name}.`, depth + 1))
      continue
    }

    flat[name] = value
  }

  return flat
}

/** Own properties of the error, minus the ones rendered elsewhere. `code`
 * becomes `error.type` (semconv). */
function carriedAttributes(error: Error): LogMeta {
  const attributes: LogMeta = {}

  for (const [key, value] of Object.entries(error)) {
    if (RENDERED_ERROR_KEYS.has(key)) {
      continue
    }

    attributes[toAttributeKey(key === 'code' ? ERROR_TYPE : key)] = value
  }

  return attributes
}

/** OTel semconv exception attributes for a log record. `exception.type` is the
 * error's `code` (stable across minification), not the class name. No stack:
 * Sentry owns it, and a stack per line is volume paid twice. PostHog reads
 * span attributes, not events — without these a failed trace shows status but
 * not cause. */
export function exceptionAttributes(error: Error): LogMeta {
  return {
    [EXCEPTION_TYPE]: error instanceof ErrorWithCode ? error.code : error.name,
    [EXCEPTION_MESSAGE]: error.message,
    ...carriedAttributes(error),
  }
}

/** The canonical line shape: bindings + meta + error fields, prefixed and
 * flattened once. No sink reshapes what it receives. */
export function shapeLine({
  bindings,
  meta,
  error,
}: {
  /** Already prefixed where the child was built. */
  bindings: Record<string, unknown>
  meta?: LogMeta
  error?: Error
}): LogMeta {
  const line = prefixKeys({
    ...meta,
    ...(error && exceptionAttributes(error)),
  })

  return flattenMeta({ ...bindings, ...line })
}

/**
 * The report follows the level: on for a failed operation, off for a line that
 * only reports. Nothing deviates — an error an outer net already reported is
 * silenced by that net, before the call, never by a flag here.
 */
export function shouldCapture(level: LogLevel): boolean {
  return level === 'error' || level === 'fatal'
}

/** Line attributes minus the exception fields: PostHog `$exception_list`
 * renders those itself, and showing them twice reads as two errors. */
export function captureProperties(line: LogMeta): LogMeta {
  const properties: LogMeta = {}

  for (const [key, value] of Object.entries(line)) {
    if (key === EXCEPTION_TYPE || key === EXCEPTION_MESSAGE) {
      continue
    }

    properties[key] = value
  }

  return properties
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false
  }

  const prototype = Object.getPrototypeOf(value)

  return prototype === Object.prototype || prototype === null
}
