import CurrentSimulationTracker from '@/components/tracking/CurrentSimulationTracker'
import { SIMULATOR_PATH } from '@/constants/urls/paths'

import {
  getCompletedSimulations,
  getCurrentSimulation,
} from '@/helpers/server/model/simulations'
import { getUserSession } from '@/services/users/get-user-session'
import { redirect } from 'next/navigation'
import Tutorial from '../_components/Tutorial'
import ButtonNext from './_components/ButtonNext'

export default async function TutorielPage({
  params,
}: PageProps<'/[locale]/simulateur/tutoriel'>) {
  const { locale } = await params
  const user = await getUserSession()

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

      <Tutorial locale={locale} buttonNext={<ButtonNext />} />
    </>
  )
}
