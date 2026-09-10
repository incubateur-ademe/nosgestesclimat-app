import { captureClickLanguage } from '@/constants/tracking/posthogTrackers'
import { useAlternateLanguagePaths } from '@/hooks/useAlternateLanguagePaths'
import i18nConfig, { type Locale } from '@/i18nConfig'
import { trackPosthogEvent } from '@/utils/analytics/trackEvent'
import { useCurrentLocale } from 'next-i18n-router/client'
import { useMemo } from 'react'

interface LanguageReturnedObject {
  url: string
  onLanguageChange: () => void
  label: string
  flag: string
  title: string
  locale: Locale
}

export function useSwitchLanguage(): {
  activeLang: LanguageReturnedObject
  inactiveLang: LanguageReturnedObject
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

  const onLanguageChange = (newLocale: Locale) => {
    trackPosthogEvent(captureClickLanguage({ locale: newLocale }))
  }

  return useMemo(() => {
    // There is no english version for the current page
    // we don't need to return the language objects
    if (!alternatePaths.en || !alternatePaths.fr) return null

    let activeLang
    let inactiveLang

    const frBaseProps = {
      url: generateLanguageUrl(alternatePaths.fr),
      onLanguageChange: () => onLanguageChange('fr'),
      label: 'FR',
      flag: '🇫🇷',
      locale: 'fr' as Locale,
    }

    const enBaseProps = {
      url: generateLanguageUrl(alternatePaths.en),
      onLanguageChange: () => onLanguageChange('en'),
      label: 'EN',
      flag: '🇬🇧',
      locale: 'en' as Locale,
    }

    if (currentLocale === 'fr') {
      activeLang = {
        title: 'FR - Langue actuelle, français. Cliquer pour changer la langue',
        ...frBaseProps,
      }
      inactiveLang = {
        title: 'EN - Set the website language to english',
        ...enBaseProps,
      }
    } else {
      inactiveLang = {
        title: 'FR - Définir le français comme langue du site',
        ...frBaseProps,
      }
      activeLang = {
        title: 'EN - Current language, english. Click to modify the language',
        ...enBaseProps,
      }
    }

    return { activeLang, inactiveLang }
  }, [currentLocale, alternatePaths])
}
