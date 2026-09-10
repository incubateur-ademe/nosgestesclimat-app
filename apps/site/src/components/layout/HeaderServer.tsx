import { Suspense } from 'react'
import { twMerge } from 'tailwind-merge'
import HideInIframe from './HideInIframe'
import LogoHeader from './headerServer/LogoHeader'
import MySpaceButton from './headerServer/MySpaceButton'

interface Props {
  isSticky?: boolean
}

export default function HeaderServer({ isSticky = true }: Props) {
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
              <MySpaceButton />
            </HideInIframe>
          </Suspense>
        }
      />
    </header>
  )
}
