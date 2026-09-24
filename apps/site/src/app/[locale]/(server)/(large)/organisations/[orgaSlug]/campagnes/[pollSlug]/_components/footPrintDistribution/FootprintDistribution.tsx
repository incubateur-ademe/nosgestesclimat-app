import Trans from '@/components/translation/trans/TransClient'
import type { ComputedResults } from '@nosgestesclimat/core/features/simulations/validators/computed-results.schema'
import MeanFootprintDistribution from './_components/MeanFootprintDistribution'

interface Props {
  computedResults?: ComputedResults | null
  userComputedResults?: ComputedResults | null
  participantsCount: number
  organisationName?: string
  isAdmin: boolean
}

export default function FootprintDistribution({
  computedResults,
  userComputedResults,
  participantsCount,
  organisationName,
  isAdmin,
}: Props) {
  if (!computedResults) return null

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
        participantsCount={participantsCount}
        isAdmin={isAdmin}
      />
    </section>
  )
}
