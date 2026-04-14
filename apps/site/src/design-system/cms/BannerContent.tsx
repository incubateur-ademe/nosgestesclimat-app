'use client'

import type { BannerType } from '@/adapters/cmsClient'
import { SIMULATOR_PATH } from '@/constants/urls/paths'
import { usePathname } from 'next/navigation'
import BannerLink from './banner/BannerLink'

export const BannerContent = ({ banner }: { banner: BannerType | null }) => {
  const pathname = usePathname()

  // Don't show banner on simulator results page
  if (pathname.startsWith(SIMULATOR_PATH) || !banner) {
    return null
  }

  return (
    <div className="bg-primary-700 xs:flex-row xs:items-center xs:gap-2 inline-flex w-full flex-col items-start justify-center gap-1 px-4 py-2 text-sm text-white md:h-12">
      <p className="mb-0 block sm:inline!">{banner.text}</p>
      <BannerLink href={banner.link.URL} label={banner.link.label} />
    </div>
  )
}
