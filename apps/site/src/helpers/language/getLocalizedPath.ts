import type { Locale } from '@/i18nConfig'
import { getLocalePrefix } from './getLocalePrefix'

/** Prefixes a relative path with the given locale (no prefix for the default locale). */
export const getLocalizedPath = (locale: Locale, path: string) =>
  `${getLocalePrefix(locale)}${path}`
