const DATE_LOCALES: Record<string, string> = {
  fr: 'fr-FR',
  en: 'en-GB',
}

export function formatLocalizedDate(
  date: string,
  locale: string,
  options: Intl.DateTimeFormatOptions
): string {
  return new Date(date).toLocaleDateString(DATE_LOCALES[locale] ?? locale, {
    timeZone: 'Europe/Paris',
    ...options,
  })
}
