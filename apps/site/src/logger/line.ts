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

/**
 * Error properties rendered elsewhere: `name` and `message` have their own
 * `exception.*` attributes, and the stack and the cause chain are the capture's,
 * which renders both — `$exception_list` lists chained exceptions. V8's `stack`
 * is non-enumerable, but an error rebuilt from a payload can carry an
 * enumerable one, and a plain object can carry a `cause`.
 */
const RENDERED_ERROR_KEYS = new Set(['name', 'message', 'cause', 'stack'])

/** Deeper objects are written as JSON text: an attribute beyond this depth is
 * not queryable anyway. */
const MAX_ATTRIBUTE_DEPTH = 4

/**
 * Puts our attributes under the `ngc.` prefix and leaves the ones another party
 * named as they are (see `toAttributeKey`). Applied where the line is built, so
 * every sink carries the same names.
 */
export function prefixKeys(meta: LogMeta): LogMeta {
  const prefixed: LogMeta = {}

  for (const [key, value] of Object.entries(meta)) {
    prefixed[toAttributeKey(key)] = value
  }

  return prefixed
}

/**
 * Flattens the meta of a line into dotted keys (`engine.key`), the shape both
 * outputs consume.
 *
 * Dots are the separator the semantic conventions use themselves
 * (`http.request.method`), and the one PostHog queries. Done once, where the
 * line is built, so stdout and the exported attributes carry the same names.
 */
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

/**
 * Flattens what the error class carries: `code` becomes `error.type`, the
 * semconv name for the class of error, and the other own properties go through
 * `toAttributeKey`. `name`, `message` and `cause` are skipped: the first two
 * have their own `exception.*` attributes, and the cause chain only survives in
 * the Sentry capture.
 *
 * Shared by the log line and the span, so one filter reads both.
 */
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

/**
 * The exception as the attributes OTel defines for it: `exception.type`,
 * `exception.message`, plus what the error class carries. The same attributes
 * serve the line and the span, so one filter reads a failed span and the line
 * that reports it.
 *
 * The span needs them even though the semantic conventions make the exception
 * a span event (`recordException`): PostHog ingests span attributes and drops
 * events, so without them a failed trace shows the status and not the cause.
 * The event stays for the backends that read it.
 *
 * `exception.type` is the error's `code` when it has one. A class name does not
 * survive minification — the build renames `SimulationCompletedError` to `d` —
 * while `code` is the stable name the same error already carries as
 * `error.type`.
 *
 * No `exception.stacktrace`: the stack belongs to Sentry, and a stack per line
 * is volume paid twice, in the drain and in PostHog. This deviates from the
 * semconv `SHOULD` on purpose — noted here so a reviewer does not "fix" it
 * back. A line carries neither stack nor cause chain, so an error whose cause
 * matters must be captured.
 *
 * `toJSON()` is not used: it only keeps `code` for `ErrorWithCode`. The error
 * rendered here is the top-level one of `warn`/`error`/`fatal`; an `Error`
 * inside the `meta` stays as it is — link a second error through `cause`
 * instead.
 */
export function exceptionAttributes(error: Error): LogMeta {
  return {
    [EXCEPTION_TYPE]: error instanceof ErrorWithCode ? error.code : error.name,
    [EXCEPTION_MESSAGE]: error.message,
    ...carriedAttributes(error),
  }
}

/**
 * The one shape a line takes: the bindings the logger carries, the call's meta,
 * and the fields an error class adds — prefixed and flattened in a single walk,
 * before any sink sees them. No sink re-shapes what it receives, and the
 * server (stdout + OTLP) and browser (console + PostHog) factories agree by
 * construction rather than by convention.
 */
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

/**
 * The line as the capture sees it: the attributes the export carries, minus the
 * two that render the error. PostHog's `$exception_list` carries the type and
 * the message in its own shape, and an issue showing them twice reads as two
 * errors.
 */
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
