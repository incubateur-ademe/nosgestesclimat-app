'use client'

import ChevronRight from '@/components/icons/ChevronRight'
import { footerClickLanguage } from '@/constants/tracking/layout'
import { captureFooterClickLanguage } from '@/constants/tracking/posthogTrackers'
import Button from '@/design-system/buttons/Button'
import DropdownMenu, {
  getDropdownMenuItemPosition,
} from '@/design-system/layout/DropdownMenu'
import Emoji from '@/design-system/utils/Emoji'
import { updateLangCookie } from '@/helpers/language/updateLangCookie'
import { useAlternateLanguagePaths } from '@/hooks/useAlternateLanguagePaths'
import i18nConfig, { type Locale } from '@/i18nConfig'
import {
  trackMatomoEvent__deprecated,
  trackPosthogEvent,
} from '@/utils/analytics/trackEvent'
import { useCurrentLocale } from 'next-i18n-router/client'
import Link from 'next/link'
import { useEffect } from 'react'
import { twMerge } from 'tailwind-merge'

interface Props {
  size?: 'xs' | 'sm'
  className?: string
}

const LANGUAGES: readonly {
  locale: Locale
  label: string
  flag: string
}[] = [
  { locale: 'fr', label: 'FR', flag: '🇫🇷' },
  { locale: 'en', label: 'EN', flag: '🇬🇧' },
]

const getLanguageTitle = (locale: Locale, isActive: boolean): string => {
  if (locale === 'fr') {
    return isActive
      ? 'FR - Langue active'
      : 'FR - Sélectionner la langue française'
  }

  return isActive ? 'EN - Active language' : 'EN - Select English language'
}

// Keep the current origin and search params, swap only the pathname for
// the one declared by the page's hreflang metadata — handles pages whose
// slugs differ per locale (e.g. action detail pages)
const generateLanguageUrl = (alternatePath: string): string => {
  const url = new URL(window.location.href)

  url.pathname = alternatePath

  return url.toString()
}

const handleLanguageClick = (newLocale: Locale) => {
  trackMatomoEvent__deprecated(footerClickLanguage(newLocale))
  trackPosthogEvent(captureFooterClickLanguage({ locale: newLocale }))
  updateLangCookie(newLocale)
}

export default function LanguageSwitchButton({
  size = 'sm',
  className,
}: Props) {
  const currentLocale = useCurrentLocale(i18nConfig)
  const alternatePaths = useAlternateLanguagePaths()

  useEffect(() => {
    // If the current locale is different than the NEXT_LOCALE cookie, we update it
    if (
      currentLocale &&
      !document.cookie.includes(`NEXT_LOCALE=${currentLocale}`)
    ) {
      updateLangCookie(currentLocale)
    }
  }, [currentLocale])

  const currentLanguage =
    LANGUAGES.find((language) => language.locale === currentLocale) ??
    LANGUAGES[0]

  const activeLocale: Locale =
    currentLocale === 'fr' || currentLocale === 'en'
      ? currentLocale
      : i18nConfig.defaultLocale

  return (
    <div className={twMerge('mr-2 max-tiny:mr-1', className)}>
      <DropdownMenu
        trigger={({ isOpen, buttonRef, buttonId, panelId, onToggle }) => (
          <Button
            ref={buttonRef}
            id={buttonId}
            size={size}
            color="secondary"
            aria-expanded={isOpen}
            aria-controls={panelId}
            aria-label={
              activeLocale === 'en'
                ? 'Select language'
                : 'Sélectionner la langue'
            }
            lang={activeLocale}
            title={getLanguageTitle(activeLocale, true)}
            data-testid="language-switch-button"
            className="inline-flex items-center gap-2 px-2 py-2 max-tiny:px-1.5 max-tiny:py-1.5 sm:px-4 sm:py-3"
            onClick={onToggle}>
            <span>{currentLanguage.label}</span>{' '}
            <Emoji>{currentLanguage.flag}</Emoji>
            <ChevronRight
              className={twMerge(
                'ml-2 max-tiny:ml-1 inline-block w-2 transition-transform',
                isOpen ? 'rotate-[-90deg]' : 'rotate-90'
              )}
            />
          </Button>
        )}>
        {({ closeMenu, getItemClassName }) => {
          const availableLanguages = LANGUAGES.filter(
            (language) => alternatePaths[language.locale]
          )

          return availableLanguages.map((language, index) => {
            const isActive = currentLocale === language.locale

            return (
              <li key={language.locale}>
                <Link
                  href={generateLanguageUrl(alternatePaths[language.locale]!)}
                  lang={language.locale}
                  aria-current={isActive ? 'true' : undefined}
                  data-testid={`language-switch-button-${language.locale}`}
                  title={getLanguageTitle(language.locale, isActive)}
                  onClick={() => {
                    handleLanguageClick(language.locale)
                    closeMenu()
                  }}
                  className={getItemClassName({
                    isActive,
                    position: getDropdownMenuItemPosition(
                      index,
                      availableLanguages.length
                    ),
                  })}>
                  <span>{language.label}</span> <Emoji>{language.flag}</Emoji>
                </Link>
              </li>
            )
          })
        }}
      </DropdownMenu>
    </div>
  )
}
