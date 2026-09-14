'use client'

import Trans from '@/components/translation/trans/TransClient'
import { carboneMetric } from '@/constants/model/metric'
import { formatFootprint } from '@/helpers/formatters/formatFootprint'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import { useLocale } from '@/hooks/useLocale'
import { MIN_PARTICIPANTS_FOR_RESULTS } from '@nosgestesclimat/core/features/polls/helpers/results-visibility'
import type { ComputedResults } from '@nosgestesclimat/core/features/simulations/validators/computed-results.schema'
import ResultsSoonBanner from './statisticsBlocks/ResultsSoonBanner'

// Create a mock results object with the default carbon footprints values for each category
const mockResults = {
  carbone: {
    bilan: 8000,
    transport: 3000,
    logement: 1000,
    alimentation: 1000,
    divers: 500,
    'services sociétaux': 2000,
  },
}

export default function StatisticsBlocks({
  participants,
  computedResults,
  isAdmin,
}: {
  participants: number
  computedResults?: ComputedResults | null
  isAdmin: boolean
}) {
  const locale = useLocale()
  const { t } = useClientTranslation()

  const hasLessThan3Participants = participants < MIN_PARTICIPANTS_FOR_RESULTS

  const result = hasLessThan3Participants ? mockResults : computedResults

  if (!result) return null

  const { formattedValue, unit } = formatFootprint(
    result.carbone.bilan / participants,
    {
      metric: carboneMetric,
      maximumFractionDigits: 1,
      localize: true,
      t,
    }
  )

  return (
    <div className="grid w-full auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="bg-primary-100 rounded-xl p-8">
        <p className="text-primary-700 text-4xl font-bold">
          {participants.toLocaleString(locale)}
        </p>

        <p className="text-xl">
          {participants <= 1 ? (
            <Trans>Simulation terminée</Trans>
          ) : (
            <Trans>Simulations terminées</Trans>
          )}
        </p>
      </div>

      {hasLessThan3Participants && (
        <ResultsSoonBanner
          isAdmin={isAdmin}
          hasLessThan3Participants={hasLessThan3Participants}
        />
      )}

      {
        // Display blocks only if simulations where fetched
        !hasLessThan3Participants && !!computedResults && (
          <div className="bg-rainbow-rotation overflow-hidden rounded-xl p-8">
            <p className="text-primary-700 text-4xl font-bold">
              {formattedValue}{' '}
              <span className="text-base font-normal">
                {unit} CO₂e <Trans>/ an</Trans>
              </span>
            </p>

            <p className="text-xl">
              <Trans>Empreinte carbone moyenne</Trans>
            </p>
          </div>
        )
      }
    </div>
  )
}
