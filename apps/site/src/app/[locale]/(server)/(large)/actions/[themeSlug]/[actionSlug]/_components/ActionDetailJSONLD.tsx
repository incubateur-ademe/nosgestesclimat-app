import JSONLD from '@/components/seo/JSONLD'
import type { Action } from '@nosgestesclimat/core/features/actions/types/action'
import { anchorActionJsonLd } from './_helpers/anchor-action-jsonld'

export default function ActionDetailJSONLD({ action }: { action: Action }) {
  const jsonLd = anchorActionJsonLd(action)

  return jsonLd.length > 0 ? <JSONLD jsonLd={jsonLd} /> : null
}
