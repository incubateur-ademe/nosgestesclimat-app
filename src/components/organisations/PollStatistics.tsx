'use client'

import Trans from '@/components/translation/trans/TransClient'
import { organisationsDashboardExportData } from '@/constants/tracking/pages/organisationsDashboard'
import { captureExportPollData } from '@/constants/tracking/posthogTrackers'
import type { ComputedResults } from '@/publicodes-state/types'
import type { PublicOrganisationPoll } from '@/types/organisations'
import {
  trackMatomoEvent__deprecated,
  trackPosthogEvent,
} from '@/utils/analytics/trackEvent'
import type { FunFacts } from '@incubateur-ademe/nosgestesclimat'
import type { ReactNode } from 'react'
import ExportDataButton from './ExportDataButton'
import DetailedStatistics from './orgaStatistics/DetailedStatistics'
import FunFactsBlock from './orgaStatistics/FunFactsBlock'
import StatisticsBlocks from './orgaStatistics/StatisticsBlocks'

export default function PollStatistics({
  title,
  simulationsCount,
  computedResults,
  funFacts,
  poll,
  isAdmin,
}: {
  title?: string | ReactNode
  simulationsCount: number
  computedResults?: ComputedResults | null
  funFacts?: FunFacts | null
  poll: PublicOrganisationPoll
  isAdmin: boolean
}) {
  const hasAtLeastThreeParticipants = simulationsCount > 2

  return (
    <>
      <div className="flex flex-col items-baseline justify-between sm:flex-row md:flex-nowrap">
        <h2 className="flex-1">{title ?? <Trans>Statistiques</Trans>}</h2>

        {poll.simulations.count >= 3 && isAdmin && (
          <ExportDataButton
            poll={poll}
            color="borderless"
            onClick={() => {
              trackMatomoEvent__deprecated(organisationsDashboardExportData)
              trackPosthogEvent(captureExportPollData)
            }}
            className="h-14"
          />
        )}
      </div>

      <section className="relative mb-8 flex gap-4">
        <StatisticsBlocks
          simulationsCount={simulationsCount}
          computedResults={computedResults}
        />
      </section>

      {hasAtLeastThreeParticipants && (
        <>
          <FunFactsBlock funFacts={funFacts} className="md:mb-8" />

          <DetailedStatistics funFacts={funFacts} className="mb-8" />
        </>
      )}
    </>
  )
}
