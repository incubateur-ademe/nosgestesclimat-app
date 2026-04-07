'use client'

import Link from '@/components/Link'
import { clickContactEvent } from '@/constants/tracking/pages/faq'
import { trackMatomoEvent__deprecated } from '@/utils/analytics/trackEvent'

export default function ContactUsLink() {
  return (
    <Link
      href="/contact"
      onClick={() => {
        trackMatomoEvent__deprecated(clickContactEvent)
      }}>
      accéder à notre page de contact
    </Link>
  )
}
