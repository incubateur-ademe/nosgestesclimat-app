import type { Locale } from '@/i18nConfig'
import i18nConfig from '@/i18nConfig'

/** URL prefix for a locale: empty for the default locale (fr), `/en` otherwise. */
export const getLocalePrefix = (locale: Locale) =>
  locale === i18nConfig.defaultLocale ? '' : `/${locale}`
