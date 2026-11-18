import JSONLD from '@/components/seo/JSONLD'
import type { Action } from '@nosgestesclimat/core/features/actions/types/action'

/** Renders the JSON-LD authored in the CMS for this action, as stored. */
export default function ActionDetailJSONLD({ action }: { action: Action }) {
  if (!action.metadata.jsonLd) return null

  return <JSONLD jsonLd={[action.metadata.jsonLd]} />
}
