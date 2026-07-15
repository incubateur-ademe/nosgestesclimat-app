import type { Locale } from '@/i18nConfig'

export async function getLocaleFromPageParams(
  params: Promise<{ locale: string }>
): Promise<Locale> {
  const { locale } = await params
  return locale as Locale
}
