'use client'

import ChevronRight from '@/components/icons/ChevronRight'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/design-system/shadcn/popover'
import Emoji from '@/design-system/utils/Emoji'
import Link from 'next/link'
import { useState } from 'react'
import { twMerge } from 'tailwind-merge'
import { useSwitchLanguage } from './languageSwitchButton/useSwitchLanguage'

interface Props {
  className?: string
}

export default function LanguageSwitchButton({ className }: Props) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  const { activeLang, inactiveLang } = useSwitchLanguage()

  return (
    <div className={twMerge('max-tiny:mr-1 mr-2', className)}>
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger>
          <button
            color="secondary"
            aria-label={activeLang.title}
            lang={activeLang.locale}
            title={activeLang.title}
            data-testid="language-switch-button"
            className="hover:bg-primary-100 active:bg-primary-200 transitions-colors inline-flex items-center gap-2 rounded-lg px-2 py-2 sm:px-4 sm:py-3">
            <Emoji>{activeLang.flag}</Emoji>
            <span className="text-primary-700 capitalize">
              {activeLang.label}
            </span>{' '}
            <ChevronRight
              className={twMerge(
                'ml-1 inline-block w-1.5 transition-transform',
                isPopoverOpen ? 'rotate-[-90deg]' : 'rotate-90'
              )}
            />
          </button>
        </PopoverTrigger>
        <PopoverContent className="z-400! max-w-24 min-w-24">
          <Link
            href={inactiveLang.url}
            lang={inactiveLang.locale}
            data-testid={`language-switch-button-${inactiveLang.locale}`}
            title={inactiveLang.title}
            onClick={() => {
              inactiveLang.onLanguageChange()
              setIsPopoverOpen(false)
            }}
            className="hover:bg-primary-50 active:bg-primary-100 rounded-sm px-2 py-2">
            <Emoji className="mr-2">{inactiveLang.flag}</Emoji>
            <span className="text-primary-700 text-base font-normal capitalize">
              {inactiveLang.label}
            </span>
          </Link>
        </PopoverContent>
      </Popover>
    </div>
  )
}
