import type { ISOSupportedLanguage } from '@nosgestesclimat/core/features/geo/types/language'

// Every supported locale must be listed: a locale added to
// ISOSupportedLanguage without an entry here fails typecheck instead of
// being silently rejected at runtime.
const supportedLocales: Record<ISOSupportedLanguage, true> = {
  fr: true,
  en: true,
}

const isSupportedLocale = (locale: string): locale is ISOSupportedLanguage =>
  Object.hasOwn(supportedLocales, locale)

/**
 * Locale contract shared by the auth actions, inherited from the old HTTP
 * query validator: a missing locale defaults to 'fr', an unsupported one
 * resolves to undefined and is rejected by the caller.
 */
export const resolveLocale = (
  locale?: string
): ISOSupportedLanguage | undefined => {
  if (locale === undefined) {
    return 'fr'
  }

  return isSupportedLocale(locale) ? locale : undefined
}
