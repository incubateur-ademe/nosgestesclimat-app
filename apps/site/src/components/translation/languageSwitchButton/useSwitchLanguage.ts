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
  languagesData: Record<Locale, Language>
  activeLocale: Locale
  inactiveLocale: Locale
} | null {
  const currentLocale = useCurrentLocale(i18nConfig)! as Locale
  const alternatePaths = useAlternateLanguagePaths()

  // Preserve search params ; also slugs may differ per locale (e.g. action detail pages)
  const buildUrlWhilePreservingParams = (alternatePath: string): string => {
    const url = new URL(window.location.href)

    url.pathname = alternatePath

    return url.toString()
  }

  return useMemo(() => {
    if (!alternatePaths.en || !alternatePaths.fr) return null

    const languagesData: Record<Locale, Language> = {
      [LOCALE_FR_KEY]: {
        url: buildUrlWhilePreservingParams(alternatePaths.fr),
        flag: '🇫🇷',
        completeLanguageString: t('shared.french', 'français'),
      },
      [LOCALE_EN_KEY]: {
        url: buildUrlWhilePreservingParams(alternatePaths.en),
        flag: '🇬🇧',
        completeLanguageString: t('shared.english', 'anglais'),
      },
    }

    return {
      languagesData,
      activeLocale: currentLocale,
      inactiveLocale:
        currentLocale === LOCALE_FR_KEY ? LOCALE_EN_KEY : LOCALE_FR_KEY,
    }
  }, [currentLocale, alternatePaths])
}
