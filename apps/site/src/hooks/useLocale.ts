import i18nConfig, { LOCALE_FR_KEY, type Locale } from '@/i18nConfig'
import { useParams } from 'next/navigation'

const isLocale = (value: unknown): value is Locale =>
  typeof value === 'string' && i18nConfig.locales.includes(value)

export function useLocale(): Locale {
  const { locale } = useParams()
  if (!isLocale(locale)) return LOCALE_FR_KEY

  return locale
}
