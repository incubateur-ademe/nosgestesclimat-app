import type { Locale } from '@/i18nConfig'

const DATE_LOCALES: Record<Locale, string> = {
  fr: 'fr-FR',
  en: 'en-GB',
}

// Event dates are stored as `timestamp without time zone` and read by Prisma
// as UTC, so display them in UTC to show the stored wall-clock date
// regardless of the server's timezone.
export function formatEventDate(
  date: string,
  locale: Locale,
  options: Intl.DateTimeFormatOptions
): string {
  return new Date(date).toLocaleDateString(DATE_LOCALES[locale], {
    timeZone: 'UTC',
    ...options,
  })
}
