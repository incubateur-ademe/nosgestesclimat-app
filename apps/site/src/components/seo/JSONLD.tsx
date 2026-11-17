import type { JsonLdNode } from '@nosgestesclimat/core/features/actions/types/seo-metadata'
import { serializeJsonLd } from './serializeJsonLd'

/**
 * Renders JSON-LD in the served HTML. Kept free of client-only code: structured
 * data injected after hydration is invisible to crawlers that do not run JS.
 */
export default function JSONLD({ jsonLd }: { jsonLd: JsonLdNode[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
    />
  )
}
