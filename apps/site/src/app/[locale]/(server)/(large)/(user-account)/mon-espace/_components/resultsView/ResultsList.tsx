import { DeleteButtonWithConfirmModal } from '@/components/interactions/DeleteButtonWithConfirmModal'
import Trans from '@/components/translation/trans/TransServer'
import { getUser } from '@/helpers/server/dal/user'
import { deleteSimulation } from '@/helpers/server/model/simulations'
import type { Locale } from '@/i18nConfig'
import type { Simulation } from '@/publicodes-state/types'
import { ResultListItem } from './resultsList/ResultListItem'
import SeeListItemDetailLink from './resultsList/SeeListItemDetailLink'

interface Props {
  locale: Locale
  simulations: Simulation[]
}

export default async function ResultsList({ locale, simulations }: Props) {
  const user = await getUser()

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
                      <DeleteButtonWithConfirmModal
                        userId={user.id}
                        simulationId={simulation.id}
                        deleteSimulation={deleteSimulation.bind(null, {
                          simulationId: simulation.id,
                          userId: user.id,
                        })}>
                        <h2 className="mb-8 text-2xl font-normal">
                          <Trans
                            locale={locale}
                            i18nKey="mySpace.resultList.item.delete.modal.title">
                            Êtes-vous sûr(e) de vouloir supprimer ce
                            résultat&nbsp;?
                          </Trans>
                        </h2>
                        {/* We need to pass this server component as a prop
                            because DeleteSimulationButton is a client component*/}
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
