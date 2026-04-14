import Trans from '@/components/translation/trans/TransClient'
import type { ComputedResults } from '@/publicodes-state/types'
import MeanFootprintDistribution from './_components/MeanFootprintDistribution'

interface Props {
  computedResults?: ComputedResults | null
  userComputedResults?: ComputedResults | null
  simulationsCount?: number
  organisationName?: string
}

export default function FootprintDistribution({
  computedResults,
  userComputedResults,
  simulationsCount,
  organisationName,
}: Props) {
  if (
    !computedResults ||
    typeof simulationsCount === 'undefined' ||
    simulationsCount < 3
  )
    return null

  return (
    <section className="mb-8">
      <h2>
        <Trans i18nKey="pollResults.distribution.title">
          Répartition des empreintes carbone
        </Trans>
      </h2>

      <MeanFootprintDistribution
        organisationName={organisationName}
        groupComputedResults={computedResults}
        userComputedResults={userComputedResults}
        simulationsCount={simulationsCount}
      />
    </section>
  )
}
