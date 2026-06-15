import type { Locale } from '@/i18nConfig'
import i18nConfig from '@/i18nConfig'
import { useCurrentLocale } from 'next-i18n-router/client'

export function useLocale(): Locale {
  return (
    (useCurrentLocale(i18nConfig) as Locale | undefined) ??
    i18nConfig.defaultLocale
  )
}
