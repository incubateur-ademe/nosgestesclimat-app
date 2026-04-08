'use client'

import Link from '@/components/Link'
import Trans from '@/components/translation/trans/TransClient'
import { captureClickResultsListResultViewDetail } from '@/constants/tracking/posthogTrackers'
import { clickResultsListResultViewDetail } from '@/constants/tracking/user-account'
import { MON_ESPACE_RESULTS_DETAIL_PATH } from '@/constants/urls/paths'
import {
  trackMatomoEvent__deprecated,
  trackPosthogEvent,
} from '@/utils/analytics/trackEvent'

export default function SeeListItemDetailLink({
  simulationId,
}: {
  simulationId: string
}) {
  return (
    <Link
      className="text-primary-700 underline"
      href={MON_ESPACE_RESULTS_DETAIL_PATH.replace(
        ':simulationId',
        simulationId
      )}
      onClick={() => {
        trackMatomoEvent__deprecated(clickResultsListResultViewDetail)
        trackPosthogEvent(captureClickResultsListResultViewDetail)
      }}>
      <Trans i18nKey="mon-espace.resultsList.result.viewDetail">
        Voir le détail
      </Trans>
    </Link>
  )
}
