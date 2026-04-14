'use client'

import { footerClickLanguage } from '@/constants/tracking/layout'
import { captureFooterClickLanguage } from '@/constants/tracking/posthogTrackers'
import ButtonAnchor from '@/design-system/buttons/ButtonAnchor'
import Emoji from '@/design-system/utils/Emoji'
import { updateLangCookie } from '@/helpers/language/updateLangCookie'
import { useIsClient } from '@/hooks/useIsClient'
import i18nConfig, { type Locale } from '@/i18nConfig'
import {
  trackMatomoEvent__deprecated,
  trackPosthogEvent,
} from '@/utils/analytics/trackEvent'
import { useCurrentLocale } from 'next-i18n-router/client'
import { useEffect } from 'react'
import { twMerge } from 'tailwind-merge'
interface Props {
  size?: 'xs' | 'sm'
  className?: string
}

const generateLanguageUrl = (newLocale: Locale): string => {
  if (typeof window === 'undefined') {
    return '#'
  }

  const url = new URL(window.location.href)

  // Remove any existing locale prefix
  url.pathname = url.pathname.replace(/^\/en/, '')

  // Add locale prefix if switching to non-default locale
  if (newLocale !== i18nConfig.defaultLocale) {
    url.pathname = `/${newLocale}${url.pathname}`
  }

  return url.toString()
}

const handleLanguageClick = (newLocale: Locale) => {
  trackMatomoEvent__deprecated(footerClickLanguage(newLocale))
  trackPosthogEvent(captureFooterClickLanguage({ locale: newLocale }))
  updateLangCookie(newLocale)
}

export default function LanguageSwitchButtonClient({
  size = 'sm',
  className,
}: Props) {
  const currentLocale = useCurrentLocale(i18nConfig)
  const isClient = useIsClient()

  useEffect(() => {
    // If the current locale is different than the NEXT_LOCALE cookie, we update it
    if (
      currentLocale &&
      !document.cookie.includes(`NEXT_LOCALE=${currentLocale}`)
    ) {
      updateLangCookie(currentLocale)
    }
  }, [currentLocale])

  return (
    <div
      className={twMerge(
        'flex flex-wrap items-center gap-1 sm:gap-2',
        className
      )}>
      <ButtonAnchor
        href={isClient ? generateLanguageUrl('fr') : '#'}
        color={currentLocale === 'fr' ? 'primary' : 'secondary'}
        onClick={() => handleLanguageClick('fr')}
        size={size}
        aria-label="Passer en français"
        lang="fr"
        title={
          currentLocale === 'fr'
            ? 'FR - Langue active'
            : 'FR - Sélectionner la langue française'
        }
        className="flex items-center gap-2 px-2 py-2 sm:px-4 sm:py-3"
        data-testid="language-switch-button-fr">
        <span>FR</span> <Emoji>🇫🇷</Emoji>
      </ButtonAnchor>

      <ButtonAnchor
        href={isClient ? generateLanguageUrl('en') : '#'}
        color={currentLocale === 'en' ? 'primary' : 'secondary'}
        onClick={() => handleLanguageClick('en')}
        size={size}
        aria-label="Switch to english"
        lang="en"
        title={
          currentLocale === 'en'
            ? 'EN - Active language'
            : 'EN - Select English language'
        }
        className="flex items-center gap-2 px-2 py-2 sm:px-4 sm:py-3"
        data-testid="language-switch-button-en">
        <span>EN</span> <Emoji>🇬🇧</Emoji>
      </ButtonAnchor>
    </div>
  )
}
