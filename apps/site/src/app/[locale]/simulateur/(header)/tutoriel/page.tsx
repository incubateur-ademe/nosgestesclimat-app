import CurrentSimulationTracker from '@/components/tracking/CurrentSimulationTracker'
import { SIMULATOR_PATH } from '@/constants/urls/paths'
import { getLocalizedPath } from '@/helpers/navigation/simulateurPages'
import { getUser } from '@/helpers/server/dal/user'
import {
  getCompletedSimulations,
  getCurrentSimulation,
} from '@/helpers/server/model/simulations'
import { redirect } from 'next/navigation'
import Tutorial from '../_components/Tutorial'
import ButtonNext from './_components/ButtonNext'

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
    redirect(getLocalizedPath('/', locale))
  }

  if (currentSimulation.progression > 0 || completedSimulations.length) {
    redirect(getLocalizedPath(SIMULATOR_PATH, locale))
  }
  return (
    <>
      <CurrentSimulationTracker currentSimulation={currentSimulation} />

      <Tutorial locale={locale} buttonNext={<ButtonNext />} />
    </>
  )
}
