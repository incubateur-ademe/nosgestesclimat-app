'use client'

import ChevronRight from '@/components/icons/ChevronRight'
import Link from '@/components/Link'
import { footerClickLanguage } from '@/constants/tracking/layout'
import { captureFooterClickLanguage } from '@/constants/tracking/posthogTrackers'
import Button from '@/design-system/buttons/Button'
import ButtonAnchor from '@/design-system/buttons/ButtonAnchor'
import DropdownMenu, {
  getDropdownMenuItemPosition,
} from '@/design-system/layout/DropdownMenu'
import Emoji from '@/design-system/utils/Emoji'
import { updateLangCookie } from '@/helpers/language/updateLangCookie'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import { useIsClient } from '@/hooks/useIsClient'
import i18nConfig, { type Locale } from '@/i18nConfig'
import {
  trackMatomoEvent__deprecated,
  trackPosthogEvent,
} from '@/utils/analytics/trackEvent'
import { useCurrentLocale } from 'next-i18n-router/client'
import { useEffect, useMemo } from 'react'
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
  url.pathname = url.pathname.replace(/^\/en/, '')

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

  const { t } = useClientTranslation()
  const locales = useMemo(
    () => [
      {
        locale: 'fr' as Locale,
        label: 'FR',
        emoji: '🇫🇷',
        ariaLabel: t('Passer en français'),
        activeTitle: t('FR - Langue active'),
        inactiveTitle: t('FR - Sélectionner la langue française'),
        openMenuLabel: t('FR - Langue active, ouvrir le menu de langue'),
        closeMenuLabel: t('FR - Langue active, fermer le menu de langue'),
      },
      {
        locale: 'en' as Locale,
        label: 'EN',
        emoji: '🇬🇧',
        ariaLabel: t('Switch to english'),
        activeTitle: t('EN - Active language'),
        inactiveTitle: t('EN - Select English language'),
        openMenuLabel: t('EN - Active language, open language menu'),
        closeMenuLabel: t('EN - Active language, close language menu'),
      },
    ],
    [t]
  )

  useEffect(() => {
    if (
      currentLocale &&
      !document.cookie.includes(`NEXT_LOCALE=${currentLocale}`)
    ) {
      updateLangCookie(currentLocale)
    }
  }, [currentLocale])

  if (!currentLocale || !i18nConfig.locales.includes(currentLocale as Locale)) {
    return null
  }

  const locale = currentLocale as Locale

  const currentLanguage = locales.find(({ locale }) => locale === currentLocale)

  return (
    <div
      className={twMerge('mr-2 flex items-center gap-1 sm:gap-2', className)}>
      <div className="md:hidden">
        <DropdownMenu
          trigger={({
            isOpen,
            buttonRef,
            buttonId,
            menuId,
            onToggle,
            onKeyDown,
          }) => {
            const ariaLabel = isOpen
              ? currentLanguage?.closeMenuLabel
              : currentLanguage?.openMenuLabel

            return (
              <Button
                ref={buttonRef}
                id={buttonId}
                size={size}
                color="primary"
                className="inline-flex items-center gap-2 px-2 py-2 sm:px-4 sm:py-3"
                data-testid="language-switch-dropdown-trigger"
                aria-expanded={isOpen}
                aria-haspopup="menu"
                aria-controls={menuId}
                aria-label={ariaLabel}
                title={ariaLabel}
                onClick={onToggle}
                onKeyDown={onKeyDown}>
                <span>{currentLanguage?.label}</span>
                <Emoji>{currentLanguage?.emoji}</Emoji>
                <ChevronRight
                  aria-hidden="true"
                  className={twMerge(
                    'ml-1 inline-block w-2 stroke-white transition-transform',
                    isOpen ? 'rotate-[-90deg]' : 'rotate-90'
                  )}
                />
              </Button>
            )
          }}>
          {({ closeMenu, getItemClassName }) =>
            locales.map(
              (
                {
                  locale,
                  label,
                  emoji,
                  ariaLabel: itemAriaLabel,
                  activeTitle,
                  inactiveTitle,
                },
                index
              ) => {
                const isActive = currentLocale === locale

                return (
                  <li key={locale}>
                    <Link
                      href={isClient ? generateLanguageUrl(locale) : '#'}
                      role="menuitem"
                      aria-current={isActive ? 'true' : undefined}
                      onClick={() => {
                        handleLanguageClick(locale)
                        closeMenu()
                      }}
                      aria-label={itemAriaLabel}
                      lang={locale}
                      title={isActive ? activeTitle : inactiveTitle}
                      className={getItemClassName({
                        isActive,
                        position: getDropdownMenuItemPosition(
                          index,
                          locales.length
                        ),
                      })}
                      data-testid={`language-switch-button-${locale}`}>
                      <span>{label}</span>
                      <Emoji>{emoji}</Emoji>
                    </Link>
                  </li>
                )
              }
            )
          }
        </DropdownMenu>
      </div>

      <div className="hidden flex-wrap items-center gap-1 sm:gap-2 md:flex">
        {locales.map(
          ({
            locale: localeOption,
            label,
            emoji,
            ariaLabel,
            activeTitle,
            inactiveTitle,
          }) => (
            <ButtonAnchor
              key={localeOption}
              href={isClient ? generateLanguageUrl(localeOption) : '#'}
              color={locale === localeOption ? 'primary' : 'secondary'}
              onClick={() => handleLanguageClick(localeOption)}
              size={size}
              aria-label={ariaLabel}
              lang={localeOption}
              title={locale === localeOption ? activeTitle : inactiveTitle}
              className="flex items-center gap-2 px-2 py-2 sm:px-4 sm:py-3"
              data-testid={`language-switch-button-${localeOption}`}>
              <span>{label}</span> <Emoji>{emoji}</Emoji>
            </ButtonAnchor>
          )
        )}
      </div>
    </div>
  )
}
