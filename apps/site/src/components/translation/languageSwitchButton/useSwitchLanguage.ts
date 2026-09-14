import { t } from '@/helpers/metadata/fakeMetadataT'
import { useAlternateLanguagePaths } from '@/hooks/useAlternateLanguagePaths'
import i18nConfig, {
  LOCALE_EN_KEY,
  LOCALE_FR_KEY,
  type Locale,
} from '@/i18nConfig'
import { useCurrentLocale } from 'next-i18n-router/client'
import { useMemo } from 'react'

interface Language {
  url: string
  flag: string
  completeLanguageString: string
}

export function useSwitchLanguage(): {
  languages: Record<Locale, Language>
  activeLocale: Locale
  inactiveLocale: Locale
} | null {
  const currentLocale = useCurrentLocale(i18nConfig)! as Locale
  const alternatePaths = useAlternateLanguagePaths()

  // Keep the current origin and search params, swap only the pathname for
  // the one declared by the page's hreflang metadata — handles pages whose
  // slugs differ per locale (e.g. action detail pages)
  const generateLanguageUrl = (alternatePath: string): string => {
    if (typeof window === 'undefined') return ''

    const url = new URL(window.location.href)

    url.pathname = alternatePath

    return url.toString()
  }

  return useMemo(() => {
    // There is no english version for the current page
    // we don't need to return the language objects
    if (!alternatePaths.en || !alternatePaths.fr) return null

    const languages: Record<Locale, Language> = {
      [LOCALE_FR_KEY]: {
        url: generateLanguageUrl(alternatePaths.fr),
        flag: '🇫🇷',
        completeLanguageString: t('shared.french', 'français'),
      },
      [LOCALE_EN_KEY]: {
        url: generateLanguageUrl(alternatePaths.en),
        flag: '🇬🇧',
        completeLanguageString: t('shared.english', 'anglais'),
      },
    }

    return {
      languages,
      activeLocale: currentLocale,
      inactiveLocale:
        currentLocale === LOCALE_FR_KEY ? LOCALE_EN_KEY : LOCALE_FR_KEY,
    }
  }, [currentLocale, alternatePaths])
}
