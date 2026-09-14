import Trans from '@/components/translation/trans/TransClient'
import type { ComputedResults } from '@nosgestesclimat/core/features/simulations/validators/computed-results.schema'
import MeanFootprintDistribution from './_components/MeanFootprintDistribution'

interface Props {
  computedResults?: ComputedResults | null
  userComputedResults?: ComputedResults | null
  participants?: number
  organisationName?: string
  isAdmin: boolean
}

export default function FootprintDistribution({
  computedResults,
  userComputedResults,
  participants,
  organisationName,
  isAdmin,
}: Props) {
  if (
    !computedResults ||
    typeof participants === 'undefined' ||
    participants < 3
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
        participants={participants}
        isAdmin={isAdmin}
      />
    </section>
  )
}
