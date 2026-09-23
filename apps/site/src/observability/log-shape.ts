import { toAttributeKey } from '@nosgestesclimat/core/features/logger/attribute-key'
import type { LogMeta } from '@nosgestesclimat/core/features/logger/index'
import type { Attributes, AttributeValue } from '@opentelemetry/api'
import type { AnyValue, LogAttributes } from '@opentelemetry/api-logs'

/** OTel names for the exception a log record carries. */
const EXCEPTION_TYPE = 'exception.type'
const EXCEPTION_MESSAGE = 'exception.message'

/** The semconv name for the class of error, where our `code` goes. */
const ERROR_TYPE = 'error.type'

/** Error properties already rendered above: `name` as `exception.type`,
 * `message` as `exception.message`, and the cause chain inside the stack. */
const RENDERED_ERROR_KEYS = new Set(['name', 'message', 'cause'])

/** Beyond this, a nested object is written as JSON text: an attribute one
 * level too deep is not queryable anyway. */
const MAX_ATTRIBUTE_DEPTH = 4

/** PostHog truncates long values anyway, and a whole stack is not needed there.
 * The line keeps its full value: this limit is the backend's. */
const MAX_ATTRIBUTE_LENGTH = 4_000

/**
 * The shape of a line, before anything consumes it: our keys under `ngc.`, the
 * objects flattened into dotted keys, the same names on stdout and in the
 * exported attributes. Done once where the line is built, not at the export
 * edge: one walk, one shape, and no rule to write twice.
 *
 * Dots are the separator the semantic conventions themselves use
 * (`http.request.method`), and the one PostHog queries.
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
 * The meta of a line, as OTLP attributes: the values of an already flat meta,
 * the rest as JSON text so a record never fails to export. The flattening is
 * the factory's (`flattenMeta`), this is the export's own value mapping — the
 * limits it applies (PostHog's) do not apply to the stdout line.
 */
export function toLogAttributes(meta: LogMeta): LogAttributes {
  const attributes: LogAttributes = {}

  for (const [key, value] of Object.entries(meta)) {
    const attribute = toAttributeValue(value)

    if (attribute !== undefined) {
      attributes[key] = attribute
    }
  }

  return attributes
}

/**
 * What the error class carries, under the name each field takes: `code` as
 * `error.type`, the semconv name for the class of error, the other properties
 * through `toAttributeKey`. The three exception names and the fields V8 keeps
 * out of the enumeration are not here — `exceptionAttributes` renders those.
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
 * The exception as the attributes OTel defines for a log record:
 * `exception.type` and `exception.message`, plus what the error class carries.
 *
 * No `exception.stacktrace`: the stack is Sentry's (`captureException`), it is
 * what a log line is worth reading for, and a stack per line is volume we pay
 * twice for — in the drain and in PostHog. Deliberate deviation from the
 * semconv `SHOULD`, so a reviewer does not "fix" it back.
 *
 * `toJSON()` is not used: it only keeps `code` for `ErrorWithCode`. This is the
 * top-level error of `warn`/`error`/`fatal`; an `Error` inside the `meta` is
 * not a case this code knows about — a second error is linked through `cause`.
 */
export function exceptionAttributes(error: Error): LogMeta {
  return {
    [EXCEPTION_TYPE]: error.name,
    [EXCEPTION_MESSAGE]: error.message,
    ...carriedAttributes(error),
  }
}

/**
 * The same fields for a span: `error.type` and the data the error class
 * carries, so a failed span filters like the line that reports it. The
 * exception itself goes to the span as its own event (`recordException`), where
 * the semantic conventions put it.
 */
export function errorAttributes(error: Error): Attributes {
  const attributes: Attributes = {}

  for (const [key, value] of Object.entries(carriedAttributes(error))) {
    const attribute = toAttributeValue(value)

    if (attribute !== undefined) {
      // Every value the mapper returns is a scalar or an array of scalars —
      // the shape OTLP wants, on a span as in a log record.
      attributes[key] = attribute as AttributeValue
    }
  }

  return attributes
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false
  }

  const prototype = Object.getPrototypeOf(value)

  return prototype === Object.prototype || prototype === null
}

function toAttributeValue(value: unknown): AnyValue {
  if (typeof value === 'string') {
    return truncate(value)
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : undefined
  }

  if (typeof value === 'boolean') {
    return value
  }

  if (Array.isArray(value) && value.every(isAttributeScalar)) {
    return value
  }

  if (value === null || value === undefined) {
    return undefined
  }

  return truncate(serialize(value))
}

function isAttributeScalar(value: unknown): value is string | number | boolean {
  return (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  )
}

function serialize(value: unknown): string {
  try {
    // `String()` because a function or a symbol has no JSON form.
    return String(JSON.stringify(value))
  } catch {
    // A circular structure has no JSON form: the line is worth more than the
    // detail.
    return String(value)
  }
}

function truncate(value: string): string {
  return value.length > MAX_ATTRIBUTE_LENGTH
    ? `${value.slice(0, MAX_ATTRIBUTE_LENGTH)}…`
    : value
}
