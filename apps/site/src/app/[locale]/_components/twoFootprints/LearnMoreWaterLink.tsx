'use client'

import Link from '@/components/Link'
import Trans from '@/components/translation/trans/TransClient'
import { learnMoreWaterLink } from '@/constants/tracking/pages/mainLanding'
import { captureLearnMoreWaterLink } from '@/constants/tracking/posthogTrackers'
import {
  trackMatomoEvent__deprecated,
  trackPosthogEvent,
} from '@/utils/analytics/trackEvent'

export default function LearnMoreWaterLink() {
  return (
    <Link
      href="/empreinte-eau"
      onClick={() => {
        trackMatomoEvent__deprecated(learnMoreWaterLink)
        trackPosthogEvent(captureLearnMoreWaterLink)
      }}
      className="text-[13px] md:text-base">
      <Trans>En savoir plus sur l'empreinte eau</Trans>
    </Link>
  )
}
