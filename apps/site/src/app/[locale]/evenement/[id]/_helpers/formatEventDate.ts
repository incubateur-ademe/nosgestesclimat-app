import type { Locale } from '@/i18nConfig'

const DATE_LOCALES: Record<Locale, string> = {
  fr: 'fr-FR',
  en: 'en-GB',
}

// Event dates are stored as `timestamp without time zone` and read by Prisma
// as UTC. The seed writes French wall-clock times (`+02:00`), so Prisma stores
// their UTC equivalent; displaying them in the Paris timezone recovers the
// intended French dates.
export function formatEventDate(
  date: string,
  locale: Locale,
  options: Intl.DateTimeFormatOptions
): string {
  return new Date(date).toLocaleDateString(DATE_LOCALES[locale], {
    timeZone: 'Europe/Paris',
    ...options,
  })
}
