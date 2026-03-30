import Trans from '@/components/translation/trans/TransServer'
import { getServerTranslation } from '@/helpers/getServerTranslation'
import type { Locale } from '@/i18nConfig'
import type { Simulation } from '@/publicodes-state/types'
import { DeleteSimulationButton } from './resultsList/DeleteSimulationButton'
import { ResultListItem } from './resultsList/ResultListItem'
import SeeListItemDetailLink from './resultsList/SeeListItemDetailLink'

interface Props {
  locale: Locale
  simulations: Simulation[]
}

export default async function ResultsList({ locale, simulations }: Props) {
  const { t } = await getServerTranslation({ locale })

  return (
    <div className="mb-8 md:mb-10">
      <h2 className="mb-6 text-2xl md:mb-8">
        <Trans locale={locale} i18nKey="mon-espace.resultsList.title">
          Tous mes résultats
        </Trans>
      </h2>

      <ul className="flex flex-col gap-2">
        {simulations
          .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          )
          .map((simulation) => {
            return (
              <li key={simulation.id}>
                <ResultListItem
                  simulation={simulation}
                  locale={locale}
                  buttons={
                    <>
                      <SeeListItemDetailLink simulationId={simulation.id} />
                      <DeleteSimulationButton
                        simulationBlock={
                          <ResultListItem
                            simulation={simulation}
                            locale={locale}
                          />
                        }
                      />
                    </>
                  }
                />
              </li>
            )
          })}
      </ul>
    </div>
  )
}
