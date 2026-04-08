'use client'

import Link from '@/components/Link'
import { trackMatomoEvent__deprecated } from '@/utils/analytics/trackEvent'
import type { ReactNode } from 'react'

export default function TitleDescLink({
  href,
  text,
  trackingEvent,
}: {
  href: string
  text: ReactNode
  trackingEvent?: string[]
}) {
  return (
    <Link
      className="text-[13px] md:text-base"
      href={href}
      onClick={() =>
        trackingEvent && trackMatomoEvent__deprecated(trackingEvent)
      }>
      {text}
    </Link>
  )
}
