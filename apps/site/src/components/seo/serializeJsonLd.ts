import * as v from 'valibot'

/**
 * Any value `JSON.stringify` can serialize. Members are optional: the CMS
 * leaves fields empty, and `JSON.stringify` drops them.
 */
const JsonValueSchema: v.GenericSchema<unknown> = v.union([
  v.string(),
  v.number(),
  v.boolean(),
  v.null(),
  v.array(v.lazy(() => JsonValueSchema)),
  v.record(v.string(), v.optional(v.lazy(() => JsonValueSchema))),
])

const JsonLdSchema = v.array(JsonValueSchema)

/**
 * Serializes JSON-LD for a `<script>` tag.
 *
 * The payload is authored in the CMS, so it is sanitized with valibot first:
 * only a list of JSON documents is accepted. `<` is then escaped so that a
 * value containing `</script>` cannot close the element it is inlined in.
 */
export function serializeJsonLd(jsonLd: unknown): string {
  const documents = v.parse(JsonLdSchema, jsonLd)

  return JSON.stringify(documents).replace(/</g, '\\u003c')
}
