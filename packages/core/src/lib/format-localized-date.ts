type SupportedDateLocale = 'fr' | 'en'

const DATE_LOCALES: Record<SupportedDateLocale, string> = {
  fr: 'fr-FR',
  en: 'en-GB',
}

export function formatLocalizedDate(
  date: Date | string,
  locale: string,
  options: Intl.DateTimeFormatOptions,
  // The current events are French-only and displayed in Europe/Paris regardless
  // of the visitor's timezone. International events will pass their own
  // timezone here (stored as an absolute instant, thanks to timestamptz).
  timeZone = 'Europe/Paris'
): string {
  const parsed = typeof date === 'string' ? new Date(date) : date
  return parsed.toLocaleDateString(
    DATE_LOCALES[locale as SupportedDateLocale] ?? locale,
    { timeZone, ...options }
  )
}
