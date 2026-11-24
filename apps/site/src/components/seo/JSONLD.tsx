export default function JSONLD({
  jsonLd,
}: {
  jsonLd: Record<string, unknown>[]
}) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd),
      }}
    />
  )
}
