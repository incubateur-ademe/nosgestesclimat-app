'use client'

import Trans from '@/components/translation/trans/TransClient'
import { organisationsDashboardExportData } from '@/constants/tracking/pages/organisationsDashboard'
import { captureExportPollData } from '@/constants/tracking/posthogTrackers'
import { formatPollStatsRefreshDuration } from '@/helpers/organisations/formatPollStatsRefreshDuration'
import { useLocale } from '@/hooks/useLocale'
import type { PollIdentifier } from '@/types/organisations'
import {
  trackMatomoEvent__deprecated,
  trackPosthogEvent,
} from '@/utils/analytics/trackEvent'
import type { FunFacts } from '@incubateur-ademe/nosgestesclimat'
import type { PollAnonymity } from '@nosgestesclimat/core/features/polls/types/poll'
import type { ComputedResults } from '@nosgestesclimat/core/features/simulations/validators/computed-results.schema'
import type { ReactNode } from 'react'
import ExportDataButton from './ExportDataButton'
import DetailedStatistics from './orgaStatistics/DetailedStatistics'
import FunFactsBlock from './orgaStatistics/FunFactsBlock'
import StatisticsBlocks from './orgaStatistics/StatisticsBlocks'

export default function PollStatistics({
  title,
  participants,
  anonymity,
  cooldownSeconds,
  computedResults,
  funFacts,
  poll,
  isAdmin,
}: {
  title?: string | ReactNode
  participants: number
  anonymity: PollAnonymity
  cooldownSeconds: number
  computedResults?: ComputedResults | null
  funFacts?: FunFacts | null
  poll: PollIdentifier
  isAdmin: boolean
}) {
  const locale = useLocale()

  const refreshNote = formatPollStatsRefreshDuration(cooldownSeconds, locale)

  return (
    <>
      <div className="flex flex-col items-baseline justify-between sm:flex-row md:flex-nowrap">
        <h2 className="flex-1">{title ?? <Trans>Statistiques</Trans>}</h2>

        {isAdmin && anonymity.isReached && (
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
          participants={participants}
          anonymity={anonymity}
          computedResults={computedResults}
          isAdmin={isAdmin}
        />
      </section>

      {anonymity.isReached && (
        <>
          <FunFactsBlock funFacts={funFacts} className="md:mb-8" />

          {refreshNote && (
            <p className="text-primary-700 mb-8 text-right text-sm italic">
              <Trans
                i18nKey="pollResults.funFacts.refreshNote"
                values={{ duration: refreshNote }}>
                {
                  'Les chiffres se mettent à jour toutes les {{duration}} environ'
                }
              </Trans>
            </p>
          )}

          <DetailedStatistics funFacts={funFacts} className="mb-8" />
        </>
      )}
    </>
  )
}
