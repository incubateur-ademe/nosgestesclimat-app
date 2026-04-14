'use client'

import { SIMULATOR_PATH } from '@/constants/urls/paths'
import { useIsClient } from '@/hooks/useIsClient'
import { getIsIframe } from '@/utils/getIsIframe'
import { usePathname } from 'next/navigation'
import type { PropsWithChildren } from 'react'

export default function Main({
  children,
  maxWidth,
  className,
  ...props
}: PropsWithChildren<{ maxWidth?: string; className?: string }>) {
  const maxWidthClass = maxWidth ? `max-w-${maxWidth} mx-auto` : ''

  const isClient = useIsClient()

  const isIframe = isClient && getIsIframe()

  const pathname = usePathname()

  return (
    <main
      id="main-content"
      role="main"
      tabIndex={-1}
      className={`flex flex-col overflow-hidden ${maxWidthClass} ${className} ${
        isIframe || pathname.startsWith(SIMULATOR_PATH)
          ? ''
          : 'min-h-[calc(100vh-2rem)]'
      }`}
      {...props}>
      {children}
    </main>
  )
}
