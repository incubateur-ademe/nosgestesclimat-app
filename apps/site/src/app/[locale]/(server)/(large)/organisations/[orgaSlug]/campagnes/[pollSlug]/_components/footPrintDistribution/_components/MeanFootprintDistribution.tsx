import Trans from '@/components/translation/trans/TransClient'
import Card from '@/design-system/layout/Card'
import type { Categories } from '@incubateur-ademe/nosgestesclimat'
import type { ComputedResults } from '@nosgestesclimat/core/features/simulations/validators/computed-results.schema'
import CategoryDistribution from './CategoryDistribution'
import CategoryRadarChart from './CategoryRadarChart'
import FootprintBarChart from './FootprintBarChart'

interface Props {
  organisationName?: string
  groupComputedResults?: ComputedResults | null
  userComputedResults?: ComputedResults | null
  participants?: number
  isAdmin: boolean
}

export default function MeanFootprintDistribution({
  organisationName,
  groupComputedResults,
  userComputedResults,
  participants,
  isAdmin,
}: Props) {
  if (!groupComputedResults) return null

  const {
    transport: meanTransport,
    alimentation: meanAlimentation,
    logement: meanLogement,
    divers: meanDivers,
    'services sociétaux': meanServices,
  } = Object.entries(groupComputedResults.carbone.categories).reduce(
    (accObject, [key, value]) => {
      accObject[key as Categories] = value / (participants ?? 1)

      return accObject
    },
    {
      transport: 0,
      alimentation: 0,
      logement: 0,
      divers: 0,
      'services sociétaux': 0,
    } as Record<Categories, number>
  )

  return (
    <div>
      <div className="flex flex-col gap-8 md:flex-row">
        <div className="flex w-full flex-col">
          <h3 className="mb-6 font-bold">
            <Trans i18nKey="pollResults.mean_footprint_distribution.title">
              Empreinte carbone moyenne de
            </Trans>{' '}
            "{organisationName}"
          </h3>

          <Card className="bg-primary-100 w-full flex-1 items-center border-0 p-6">
            <FootprintBarChart
              groupFootprint={
                groupComputedResults?.carbone?.bilan / (participants ?? 1)
              }
              userFootprint={userComputedResults?.carbone?.bilan}
            />
          </Card>
        </div>
        <div className="w-full">
          {(isAdmin || !userComputedResults) && (
            <CategoryDistribution
              categoryValues={{
                transport: meanTransport,
                alimentation: meanAlimentation,
                logement: meanLogement,
                divers: meanDivers,
                'services sociétaux': meanServices,
              }}
            />
          )}
          {!isAdmin && userComputedResults && (
            <CategoryRadarChart
              userValues={Object.entries(
                userComputedResults.carbone.categories
              ).reduce(
                (accObject, [key, value]) => {
                  accObject[key as Categories] = value
                  return accObject
                },
                {
                  transport: 0,
                  alimentation: 0,
                  logement: 0,
                  divers: 0,
                  'services sociétaux': 0,
                } as Record<Categories, number>
              )}
              averageValues={{
                transport: meanTransport,
                alimentation: meanAlimentation,
                logement: meanLogement,
                divers: meanDivers,
                'services sociétaux': meanServices,
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
