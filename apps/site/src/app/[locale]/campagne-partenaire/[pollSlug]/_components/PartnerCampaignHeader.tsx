'use client'

import CloseIcon from '@/components/icons/Close'
import Logo from '@/components/misc/Logo'
import LanguageSwitchButton from '@/components/translation/LanguageSwitchButton'
import Image from 'next/image'

export default function PartnerCampaignHeader({
  logoSrc,
  alt,
}: {
  logoSrc: string
  alt: string
}) {
  return (
    <header className="border-b border-gray-200 bg-white shadow-xs">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-1 px-4 py-3 sm:gap-4 sm:px-0 sm:py-3">
        <div className="flex items-center gap-1 sm:gap-3">
          <Logo size="xs" />

          <CloseIcon className="w-4 md:w-10" />

          <div className="h-full max-h-12">
            <Image
              src={logoSrc}
              className="h-full max-h-12 w-auto object-contain"
              width="100"
              height="100"
              alt={alt ?? ''}
            />
          </div>
        </div>

        {/* Mobile */}
        <div className="block sm:hidden">
          <LanguageSwitchButton size="xs" />
        </div>

        {/* Desktop */}
        <div className="hidden sm:block">
          <LanguageSwitchButton />
        </div>
      </div>
    </header>
  )
}
