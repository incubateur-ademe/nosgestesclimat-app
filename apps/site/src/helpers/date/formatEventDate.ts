import type { Locale } from '@/i18nConfig'

// 'en' alone would fall back to US-style month-first output ("September 18,
// 2026"); 'en-GB' keeps the day-first format the French service displays.
const DATE_LOCALES: Record<Locale, string> = {
  fr: 'fr-FR',
  en: 'en-GB',
}

export function formatEventDate(
  date: Date | string,
  locale: Locale,
  timeZone: string,
  options: Intl.DateTimeFormatOptions
): string {
  const parsed = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat(DATE_LOCALES[locale], {
    timeZone,
    ...options,
  }).format(parsed)
}
