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
      // `<` is escaped so that a value holding `</script>` cannot close the
      // element it is inlined in.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
      }}
    />
  )
}
