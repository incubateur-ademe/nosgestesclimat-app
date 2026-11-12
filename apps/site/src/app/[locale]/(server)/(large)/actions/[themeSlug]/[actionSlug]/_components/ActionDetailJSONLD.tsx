import JSONLD from '@/components/seo/JSONLD'
import type { Locale } from '@/i18nConfig'
import type { Action } from '@nosgestesclimat/core/features/actions/types/action'
import { buildActionDetailJsonLd } from '../_helpers/buildActionDetailJsonLd'

export default function ActionDetailJSONLD({
  action,
  locale,
}: {
  action: Action
  locale: Locale
}) {
  const jsonLd = buildActionDetailJsonLd(action, locale)

  if (jsonLd.length === 0) {
    return null
  }

  return <JSONLD jsonLd={jsonLd} />
}
