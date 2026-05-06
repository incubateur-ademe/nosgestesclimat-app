import CurrentSimulationTracker from '@/components/tracking/CurrentSimulationTracker'
import Trans from '@/components/translation/trans/TransServer'
import { SIMULATOR_PATH } from '@/constants/urls/paths'
import ButtonLink from '@/design-system/buttons/ButtonLink'
import { getUser } from '@/helpers/server/dal/user'
import {
  getCompletedSimulations,
  getCurrentSimulation,
} from '@/helpers/server/model/simulations'
import { redirect } from 'next/navigation'
import Tutorial from '../_components/Tutorial'

export default async function TutorielPage({
  params,
}: PageProps<'/[locale]/simulateur/tutoriel'>) {
  const { locale } = await params
  const user = await getUser()

  const [currentSimulation, completedSimulations] = await Promise.all([
    getCurrentSimulation({ user }),
    getCompletedSimulations({ user }, { pageSize: 1 }),
  ])

  if (!currentSimulation) {
    redirect('/')
  }

  if (currentSimulation.progression > 0 || completedSimulations.length) {
    redirect(SIMULATOR_PATH)
  }
  return (
    <>
      <CurrentSimulationTracker currentSimulation={currentSimulation} />
      <Tutorial
        locale={locale}
        buttonNext={
          <ButtonLink
            href={SIMULATOR_PATH}
            data-testid="skip-tutorial-button"
            className="min-w-42!">
            <Trans locale={locale}>C'est parti !</Trans>{' '}
            <span aria-hidden="true">→</span>
          </ButtonLink>
        }
      />
    </>
  )
}
