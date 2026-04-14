import type { Config } from 'next-i18n-router/dist/types'
import type { NextRequest } from 'next/server'

export const LOCALE_EN_KEY = 'en'
export const LOCALE_FR_KEY = 'fr'

export const NEXT_LOCALE_COOKIE_NAME = 'NEXT_LOCALE'

export type Locale = 'fr' | 'en'

const i18nConfig: Config & { locales: Locale[]; defaultLocale: Locale } = {
  locales: [LOCALE_FR_KEY, LOCALE_EN_KEY],
  defaultLocale: LOCALE_FR_KEY,
  cookieOptions: {
    sameSite: 'none' as const,
    path: '/',
    maxAge: 31536000,
    secure: true, // Required when using SameSite=None
  },
  localeDetector: (request: NextRequest, config: Config): string => {
    // Check for NEXT_LOCALE cookie
    const nextLocale = request.cookies.get(NEXT_LOCALE_COOKIE_NAME)?.value
    if (nextLocale && config.locales.includes(nextLocale)) {
      return nextLocale
    }

    // Check browser language
    const acceptLanguage = request.headers.get('accept-language')
    if (acceptLanguage) {
      const browserLang = acceptLanguage.split(',')[0].split('-')[0]
      if (config.locales.includes(browserLang)) {
        return browserLang
      }
    }

    // Return default locale
    return config.defaultLocale
  },
}

export default i18nConfig
