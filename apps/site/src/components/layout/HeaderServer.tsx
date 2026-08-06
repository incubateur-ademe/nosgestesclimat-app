import { Suspense } from 'react'
import { twMerge } from 'tailwind-merge'
import HideInIframe from './HideInIframe'
import MySpaceButton from './headerServer/MySpaceButton'
import LogoHeader from './headerServer/LogoHeader'

interface Props {
  isSticky?: boolean
  locale: string
}

export default function HeaderServer({ isSticky = true, locale }: Props) {
  return (
    <header
      id="header-server-container"
      className={twMerge(
        'h-20 items-center bg-white shadow-xs',
        isSticky ? 'sticky top-0 z-300' : ''
      )}>
      <LogoHeader
        rightContent={
          <Suspense fallback={null}>
            {/*Suspense for enabling partial prerendering */}
            <HideInIframe hideIfNotFrenchRegion>
              <MySpaceButton locale={locale} />
            </HideInIframe>
          </Suspense>
        }
      />
    </header>
  )
}
