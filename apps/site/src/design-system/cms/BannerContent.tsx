'use client'

import type { BannerType } from '@/adapters/cmsClient'
import { SIMULATOR_PATH } from '@/constants/urls/paths'
import { usePathname } from 'next/navigation'
import { twMerge } from 'tailwind-merge'
import BannerLink from './banner/BannerLink'

export type BannerColor = 'primary' | 'secondary'

const colorClassNames: Record<BannerColor, string> = {
  primary: 'bg-primary-700 text-white',
  secondary: 'text-secondary-900 bg-secondary-100',
}

export const BannerContent = ({
  banner,
  color = 'primary',
}: {
  banner: Pick<BannerType, 'link' | 'text'> | null
  color?: BannerColor
}) => {
  const pathname = usePathname()

  // Don't show banner on simulator results page
  if (pathname.startsWith(SIMULATOR_PATH) || !banner) {
    return null
  }

  return (
    <div
      className={twMerge(
        colorClassNames[color],
        'xs:flex-row xs:items-center xs:gap-2 inline-flex w-full flex-col items-start justify-center gap-1 px-4 py-2 text-sm md:h-12'
      )}>
      <p className="mb-0 block sm:inline!">{banner.text}</p>
      {banner.link && (
        <BannerLink href={banner.link.URL} label={banner.link.label} />
      )}
    </div>
  )
}
