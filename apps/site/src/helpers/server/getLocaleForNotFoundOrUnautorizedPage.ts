import type { Locale } from '@/i18nConfig'
import { headers } from 'next/headers'

/**
 * Retrieves the locale for Next.js special convention pages such as `unauthorized.tsx` or `not-found.tsx`.
 * This can also be used to retrieve locale in server actions
 *
 * Special convention files do not receive route params, so the locale cannot be extracted
 * from the page props. Instead, we read the locale from the `x-next-i18n-router-locale`
 * request header, which is set by the i18n router middleware.
 *
 * Next.JS = 🤮
 *
 * @returns A promise that resolves to the current {@link Locale}.
 */
export async function getLocaleFromHeaders(): Promise<Locale> {
  const headersList = await headers()
  const locale = headersList.get('x-next-i18n-router-locale')
  return locale as Locale
}
