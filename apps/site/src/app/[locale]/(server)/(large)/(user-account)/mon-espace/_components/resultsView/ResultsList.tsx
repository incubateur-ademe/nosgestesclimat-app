import { DeleteButtonWithConfirmModal } from '@/components/interactions/DeleteButtonWithConfirmModal'
import Trans from '@/components/translation/trans/TransServer'
import type { Simulation } from '@/helpers/server/model/simulations'
import type { Locale } from '@/i18nConfig'
import dayjs from 'dayjs'
import { ResultListItem } from './resultsList/ResultListItem'
import SeeListItemDetailLink from './resultsList/SeeListItemDetailLink'

interface Props {
  locale: Locale
  simulations: Simulation[]
  onSimulationDelete: (id: string) => Promise<void>
  isNewAccount: boolean
}

export default function ResultsList({
  locale,
  simulations,
  onSimulationDelete,
  isNewAccount,
}: Props) {
  return (
    <div className="mb-8 md:mb-10">
      <h2 className="mb-6 text-2xl md:mb-8">
        <Trans locale={locale} i18nKey="mon-espace.resultsList.title">
          Tous mes résultats
        </Trans>
      </h2>

      {getShouldDisplayHelperText({
        isNewAccount,
        simulations,
      }) && (
        <p className="mb-4">
          <Trans
            locale={locale}
            i18nKey="mon-espace.resultsList.hasMigratedSimulations">
            Nous avons retrouvé des simulations sur ce navigateur et les avons
            ajoutées à votre espace. Vous pouvez les supprimer à tout moment.
          </Trans>
        </p>
      )}

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
                      <DeleteButtonWithConfirmModal
                        deleteAction={async () => {
                          'use server'
                          await onSimulationDelete(simulation.id)
                        }}>
                        <h2 className="mb-8 text-2xl font-normal">
                          <Trans
                            locale={locale}
                            i18nKey="mySpace.resultList.item.delete.modal.title">
                            Êtes-vous sûr(e) de vouloir supprimer ce
                            résultat&nbsp;?
                          </Trans>
                        </h2>
                        <ResultListItem
                          simulation={simulation}
                          locale={locale}
                        />
                      </DeleteButtonWithConfirmModal>
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

const getShouldDisplayHelperText = ({
  isNewAccount,
  simulations,
}: {
  isNewAccount: boolean
  simulations: Simulation[]
}) => {
  // Only show text to newcomers
  if (!isNewAccount) return false

  // That either have more than one simulation
  if (simulations.length > 1) return true

  // Or that have one simulation created in the past
  if (
    simulations.length === 1 &&
    dayjs(simulations[0].updated_at).isBefore(dayjs())
  )
    return true

  return false
}
