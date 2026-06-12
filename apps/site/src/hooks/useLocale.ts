import { languages } from '@/constants/localisation/translation'
import type { Locale } from '@/i18nConfig'
import i18nConfig from '@/i18nConfig'
import { useCurrentLocale } from 'next-i18n-router/client'

export function useLocale(): Locale {
  const currentLocale = useCurrentLocale(i18nConfig) as Locale | undefined

  // 1. Try to get locale from URL search param (most explicit, used by iframe integrators)
  if (typeof window !== 'undefined') {
    const searchParams = new URLSearchParams(window.location.search)
    const urlParamLocale = searchParams.get('lang')
    if (urlParamLocale && languages.includes(urlParamLocale)) {
      return urlParamLocale as Locale
    }
  }

  // 2. Fall back to useCurrentLocale (cookie-based) or default
  return currentLocale ?? i18nConfig.defaultLocale
}
