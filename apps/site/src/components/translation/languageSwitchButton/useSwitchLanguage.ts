import { captureClickLanguage } from '@/constants/tracking/posthogTrackers'
import { updateLangCookie } from '@/helpers/language/updateLangCookie'
import { useAlternateLanguagePaths } from '@/hooks/useAlternateLanguagePaths'
import i18nConfig, { type Locale } from '@/i18nConfig'
import { trackPosthogEvent } from '@/utils/analytics/trackEvent'
import { useCurrentLocale } from 'next-i18n-router/client'
import { useEffect, useMemo } from 'react'

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
} {
  const currentLocale = useCurrentLocale(i18nConfig)! as Locale
  const alternatePaths = useAlternateLanguagePaths()

  useEffect(() => {
    // If the current locale is different than the NEXT_LOCALE cookie, we update it
    if (!document.cookie.includes(`NEXT_LOCALE=${currentLocale}`)) {
      updateLangCookie(currentLocale)
    }
  }, [currentLocale])

  // Keep the current origin and search params, swap only the pathname for
  // the one declared by the page's hreflang metadata — handles pages whose
  // slugs differ per locale (e.g. action detail pages)
  const generateLanguageUrl = (alternatePath: string): string => {
    if (typeof window == 'undefined') return ''

    const url = new URL(window.location.href)

    url.pathname = alternatePath

    return url.toString()
  }

  const onLanguageChange = (newLocale: Locale) => {
    trackPosthogEvent(captureClickLanguage({ locale: newLocale }))
    updateLangCookie(newLocale)
  }

  const { activeLang, inactiveLang } = useMemo(() => {
    let activeLang
    let inactiveLang

    const frBaseProps = {
      url: generateLanguageUrl(alternatePaths.fr!),
      onLanguageChange: () => onLanguageChange('fr'),
      label: 'FR',
      flag: '🇫🇷',
      locale: 'fr' as Locale,
    }

    const enBaseProps = {
      url: generateLanguageUrl(alternatePaths.en!),
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

  return {
    activeLang,
    inactiveLang,
  }
}
