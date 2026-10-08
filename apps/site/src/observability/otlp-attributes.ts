import type { LogMeta } from '@nosgestesclimat/core/features/logger/index'
import type { Attributes } from '@opentelemetry/api'
import type { AnyValue, LogAttributes } from '@opentelemetry/api-logs'

/** The value length PostHog keeps. Export-side only: the stdout line keeps its
 * full value. */
const MAX_ATTRIBUTE_LENGTH = 4_000

/** Maps line meta to OTLP attribute values: scalars pass through, others
 * become JSON text so export never fails. Limits here are PostHog's; stdout
 * keeps full values. */
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
 * The same mapping for a span: `setAttributes` takes `AttributeValue` where a
 * log record's `AnyValue` is wider. The values are already narrowed by
 * `toAttributeValue`, so the cast cannot smuggle one OTLP would reject.
 */
export function toSpanAttributes(meta: LogMeta): Attributes {
  return toLogAttributes(meta) as Attributes
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

  // `null` is the absence of a value: dropping it beats exporting an empty one
  // a filter would read as set.
  return value == null ? undefined : truncate(serialize(value))
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
