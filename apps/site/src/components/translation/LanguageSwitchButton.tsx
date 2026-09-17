'use client'

import ChevronRight from '@/components/icons/ChevronRight'
import { captureClickLanguage } from '@/constants/tracking/posthogTrackers'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/design-system/shadcn/popover'
import Emoji from '@/design-system/utils/Emoji'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import { trackPosthogEvent } from '@/utils/analytics/trackEvent'
import Link from 'next/link'
import { twMerge } from 'tailwind-merge'
import './languageSwitchButton/style.css'
import { useSwitchLanguage } from './languageSwitchButton/useSwitchLanguage'

interface Props {
  className?: string
}

export default function LanguageSwitchButton({ className }: Props) {
  const { t } = useClientTranslation()

  const switchLanguageObject = useSwitchLanguage()
  if (!switchLanguageObject) return null

  const { languagesData, activeLocale, inactiveLocale } = switchLanguageObject
  const activeLang = languagesData[activeLocale]
  const inactiveLang = languagesData[inactiveLocale]

  const triggerTitle = t(
    'switchLang.linkTitle',
    '{{languageAbbreviation}} - Langue actuelle, {{completeLanguageString}}. Cliquer pour changer la langue',
    {
      languageAbbreviation: activeLocale.toUpperCase(),
      completeLanguageString: activeLang.completeLanguageString,
    }
  )

  return (
    <div className={twMerge('max-tiny:mr-1 mr-2', className)}>
      <Popover>
        <PopoverTrigger
          color="secondary"
          aria-label={triggerTitle}
          lang={activeLocale}
          title={triggerTitle}
          data-testid="language-switch-button"
          className="hover:bg-primary-100 active:bg-primary-200 transitions-colors inline-flex items-center gap-2 rounded-lg px-2 py-2 sm:px-4 sm:py-3 [&[aria-expanded=true]>svg]:-rotate-90!">
          <Emoji>{activeLang.flag}</Emoji>
          <span className="text-primary-700 capitalize">
            {activeLocale.toUpperCase()}
          </span>{' '}
          <ChevronRight
            className={twMerge(
              'ml-1 inline-block w-1.5 rotate-90 transition-transform'
            )}
          />
        </PopoverTrigger>
        <PopoverContent className="z-400! max-w-24 min-w-24">
          <Link
            prefetch={false}
            href={inactiveLang.url}
            lang={inactiveLocale}
            data-testid={`language-switch-button-${inactiveLocale}`}
            title={t(
              'switchLang.linkTitle',
              '{{languageAbbreviation}} - Définir le {{completeLanguageString}} comme langue du site',
              {
                languageAbbreviation: inactiveLocale.toUpperCase(),
                completeLanguageString: inactiveLang.completeLanguageString,
              }
            )}
            onClick={() => {
              trackPosthogEvent(
                captureClickLanguage({ locale: inactiveLocale })
              )
            }}
            className="hover:bg-primary-50 active:bg-primary-100 rounded-sm px-2 py-2">
            <Emoji className="mr-2">{inactiveLang.flag}</Emoji>
            <span className="text-primary-700 text-base font-normal capitalize">
              {inactiveLocale.toUpperCase()}
            </span>
          </Link>
        </PopoverContent>
      </Popover>
    </div>
  )
}
