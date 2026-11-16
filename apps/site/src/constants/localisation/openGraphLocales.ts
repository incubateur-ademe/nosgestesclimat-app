import type { Locale } from '@/i18nConfig'

/**
 * Open Graph has no locale-neutral form: `og:locale` must be a
 * `language_TERRITORY` tag. Everywhere else (`html lang`, `hreflang`,
 * JSON-LD `inLanguage`) the plain `fr` / `en` locale is used, so the region is
 * only stated here.
 */
export const OPEN_GRAPH_LOCALES: Record<Locale, string> = {
  fr: 'fr_FR',
  en: 'en_GB',
}
