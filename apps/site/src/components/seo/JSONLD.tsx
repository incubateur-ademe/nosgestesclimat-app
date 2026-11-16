/**
 * Serializes JSON-LD for a `<script>` tag. `<` is escaped so that a payload
 * containing `</script>` cannot break out of the script element.
 */
const serializeJsonLd = (jsonLd: Record<string, unknown>[]) =>
  JSON.stringify(jsonLd).replace(/</g, '\\u003c')

/**
 * Renders JSON-LD in the served HTML. Kept free of client-only code: structured
 * data injected after hydration is invisible to crawlers that do not run JS.
 */
export default function JSONLD({
  jsonLd,
}: {
  jsonLd: Record<string, unknown>[]
}) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: serializeJsonLd(jsonLd),
      }}
    />
  )
}
