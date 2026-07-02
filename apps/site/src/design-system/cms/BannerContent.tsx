'use client'

import type { BannerType } from '@/adapters/cmsClient'
import CloseIcon from '@/components/icons/Close'
import { SIMULATOR_PATH } from '@/constants/urls/paths'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import { safeLocalStorage } from '@/utils/browser/safeLocalStorage'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { twMerge } from 'tailwind-merge'
import Button from '../buttons/Button'
import BannerLink from './banner/BannerLink'

export type BannerColor = 'primary' | 'secondary'

export const STORAGE_KEY_PREFIX = 'hide-banner-'

const colorClassNames: Record<BannerColor, string> = {
  primary: 'bg-primary-700 text-white',
  secondary: 'text-secondary-900 bg-secondary-100',
}

export const BannerContent = ({
  banner,
  color = 'primary',
}: {
  banner: BannerType
  color?: BannerColor
}) => {
  const [shouldHideBanner, setShouldHideBanner] = useState(false)

  // Necessary to let hydration occur first
  useEffect(() => {
    setShouldHideBanner(
      safeLocalStorage.getItem(`${STORAGE_KEY_PREFIX}-${banner.id}`) === 'true'
    )
  }, [banner.id])

  const pathname = usePathname()

  const { t } = useClientTranslation()

  // Don't show banner on simulator results page
  if (pathname.startsWith(SIMULATOR_PATH) || shouldHideBanner) {
    return null
  }

  const closeButtonString = t('banner.close', 'Fermer la bannière')

  return (
    <div
      className={twMerge(
        colorClassNames[color],
        'xs:flex-row xs:items-center xs:gap-2 relative inline-flex w-full flex-col items-start justify-center gap-1 px-4 py-2 text-sm md:h-12'
      )}>
      <p className="mb-0 block sm:inline!">{banner.text}</p>
      {banner.link && (
        <BannerLink href={banner.link.URL} label={banner.link.label} />
      )}

      <Button
        onClick={() => {
          safeLocalStorage.setItem(`${STORAGE_KEY_PREFIX}-${banner.id}`, 'true')
          setShouldHideBanner(true)
        }}
        color="secondary"
        aria-label={closeButtonString}
        title={closeButtonString}
        className="bg-primary-700 hover:bg-primary-700 -m-2.5 ml-1 border-none p-2.5! md:absolute md:top-2.5 md:right-4">
        <CloseIcon className="hover:fill-primary-200 max-h-6 min-w-6 fill-white transition-colors" />
      </Button>
    </div>
  )
}
