'use client'

import type { BannerType } from '@/adapters/cmsClient'
import CloseIcon from '@/components/icons/Close'
import { SIMULATOR_PATH } from '@/constants/urls/paths'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import { safeLocalStorage } from '@/utils/browser/safeLocalStorage'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { twMerge } from 'tailwind-merge'
import BannerLink from './banner/BannerLink'

export type BannerColor = 'primary' | 'secondary'

export const STORAGE_KEY_PREFIX = 'hide-banner-'

const colorClassNames: Record<
  BannerColor,
  { container: string; closeButton: string; closeIcon: string }
> = {
  primary: {
    container: 'bg-primary-700 text-white',
    closeButton: 'bg-primary-700 hover:bg-primary-800 active:bg-primary-900',
    closeIcon: 'fill-white hover:fill-primary-800 active:scale-90',
  },
  secondary: {
    container: 'text-secondary-900 bg-secondary-100',
    closeButton: 'bg-secondary-100',
    closeIcon: 'fill-secondary-800 hover:fill-secondary-900 active:scale-90',
  },
}

export const BannerContent = ({
  banner,
  color = 'primary',
}: {
  banner: Pick<BannerType, 'link' | 'text' | 'id'> | null
  color?: BannerColor
}) => {
  const [shouldHideBanner, setShouldHideBanner] = useState(false)

  // Necessary to let hydration occur first
  useEffect(() => {
    if (!banner) return
    setShouldHideBanner(
      safeLocalStorage.getItem(`${STORAGE_KEY_PREFIX}-${banner.id}`) === 'true'
    )
  }, [banner, banner?.id])

  const pathname = usePathname()

  const { t } = useClientTranslation()

  // Don't show banner on simulator results page
  if (pathname.startsWith(SIMULATOR_PATH) || shouldHideBanner || !banner) {
    return null
  }

  const closeButtonString = t('banner.close', 'Fermer la bannière')

  return (
    <div
      className={twMerge(
        colorClassNames[color].container,
        'xs:gap-2 relative inline-flex w-full flex-row items-start justify-center gap-1 px-4 py-2 text-sm sm:items-center md:h-12'
      )}>
      <p className="mb-0 block sm:inline!">{banner.text}</p>
      {banner.link && (
        <BannerLink href={banner.link.URL} label={banner.link.label} />
      )}

      <button
        onClick={() => {
          safeLocalStorage.setItem(`${STORAGE_KEY_PREFIX}-${banner.id}`, 'true')
          setShouldHideBanner(true)
        }}
        color={color}
        aria-label={closeButtonString}
        title={closeButtonString}
        className={`-mt-1 -mr-2 border-none md:absolute md:top-2.5 md:right-4 md:-m-2.5 md:ml-1 md:p-2.5! ${colorClassNames[color].closeButton}`}>
        <CloseIcon
          className={`max-h-6 min-w-6 transition-transform ${colorClassNames[color].closeIcon}`}
        />
      </button>
    </div>
  )
}
