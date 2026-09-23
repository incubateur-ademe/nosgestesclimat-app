import type { LogMeta } from '@nosgestesclimat/core/features/logger/index'
import type { AnyValue, LogAttributes } from '@opentelemetry/api-logs'

/** OTel names for the exception a log record carries. */
const EXCEPTION_TYPE = 'exception.type'
const EXCEPTION_MESSAGE = 'exception.message'
const EXCEPTION_STACKTRACE = 'exception.stacktrace'

/** Beyond this, a nested object is exported as JSON text: an attribute one
 * level too deep is not queryable anyway. */
const MAX_ATTRIBUTE_DEPTH = 4

/** PostHog truncates long values anyway, and a whole stack is not needed there. */
const MAX_ATTRIBUTE_LENGTH = 4_000

/** Key names censored on export. The stdout line is redacted by pino, but the
 * OTLP path bypasses it — pino redacts its serialized output, not the object it
 * is handed — so the censor runs here, at the one place every exported
 * attribute goes through. A key name matches at any depth, which is wider than
 * the stdout paths: an export to a third party errs on the strict side. */
const REDACTED_KEY_NAMES = new Set(['email', 'password', 'token', 'cookie'])

/**
 * The meta of a line, as OTLP attributes: flat, in the dotted-key shape
 * PostHog can query (`engine.key`), the rest as JSON text so a record never
 * fails to export. Dots are the separator the semantic conventions themselves
 * use (`http.request.method`).
 *
 * This runs at the export edge, not in the logger factory: the stdout line
 * keeps its nested shape, which flattening would lose (`a.b` and `a: { b }`
 * would merge into one key).
 */
export function toLogAttributes(meta: LogMeta): LogAttributes {
  const attributes: LogAttributes = {}

  for (const [key, value] of Object.entries(flattenAttributes(meta))) {
    const attribute = isRedacted(key) ? '[redacted]' : toAttributeValue(value)

    if (attribute !== undefined) {
      attributes[key] = attribute
    }
  }

  return attributes
}

/**
 * The exception as its own attributes: the three names OTel defines for a log
 * record (`exception.type`, `exception.message`, `exception.stacktrace`, the
 * cause chain appended), plus what the error class carries: `code` becomes
 * `error.type` — the semconv name for the class of error — and the other fields
 * take our `ngc.` prefix. `toJSON()` is not used: it only keeps `code` for
 * `ErrorWithCode`. Used for the stdout line;
 * `toLogAttributes` calls it back for an `Error` found inside the meta.
 */
export function exceptionAttributes(error: Error): LogMeta {
  const attributes: LogMeta = {
    [EXCEPTION_TYPE]: error.name,
    [EXCEPTION_MESSAGE]: error.message,
    [EXCEPTION_STACKTRACE]: stackTrace(error),
  }

  for (const [key, value] of Object.entries(error)) {
    // `name` is `exception.type` and `message` is `exception.message`; the
    // stacktrace already carries the cause chain.
    if (key === 'name' || key === 'message' || key === 'cause') {
      continue
    }

    // The domain code is what semconv calls the class of error.
    if (key === 'code') {
      attributes['error.type'] = value
      continue
    }

    // The rest is our domain's data, and follows the same rule as the meta.
    attributes[`ngc.${key}`] = value
  }

  return attributes
}

function flattenAttributes(meta: LogMeta, prefix = '', depth = 0): LogMeta {
  const flat: LogMeta = {}

  for (const [key, value] of Object.entries(meta)) {
    const name = `${prefix}${key}`

    if (value instanceof Error) {
      Object.assign(
        flat,
        flattenAttributes(exceptionAttributes(value), `${name}.`, depth)
      )
      continue
    }

    if (isPlainObject(value) && depth < MAX_ATTRIBUTE_DEPTH) {
      Object.assign(flat, flattenAttributes(value, `${name}.`, depth + 1))
      continue
    }

    flat[name] = value
  }

  return flat
}

/** The last segment decides: `ngc.session.token` is censored like `ngc.token`.
 * An exact name only — `tokenCount` is data, not a secret. */
function isRedacted(key: string): boolean {
  return REDACTED_KEY_NAMES.has(key.split('.').at(-1) ?? '')
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

/** V8 keeps the stack out of the enumerable properties: it is read here. */
function stackTrace(error: Error): string {
  const frames: string[] = []
  let current: unknown = error

  for (let depth = 0; current instanceof Error && depth < 5; depth++) {
    const label = depth === 0 ? '' : 'Caused by: '
    frames.push(
      `${label}${current.stack ?? `${current.name}: ${current.message}`}`
    )
    current = current.cause
  }

  return frames.join('\n')
}
