import CurrentSimulationTracker from '@/components/tracking/CurrentSimulationTracker'
import { SIMULATOR_PATH } from '@/constants/urls/paths'

import { getCompletedSimulations } from '@/services/simulations/get-completed-simulations'
import { getCurrentSimulation } from '@/services/simulations/get-current-simulation'
import { redirect } from 'next/navigation'
import Tutorial from '../_components/Tutorial'
import ButtonNext from './_components/ButtonNext'

export default async function TutorielPage({
  params,
}: PageProps<'/[locale]/simulateur/tutoriel'>) {
  const { locale } = await params

  const [currentSimulation, completedSimulations] = await Promise.all([
    getCurrentSimulation(),
    getCompletedSimulations({ pageSize: 1 }),
  ])

  if (
    (currentSimulation && currentSimulation.progression > 0) ||
    completedSimulations.length
  ) {
    redirect(SIMULATOR_PATH)
  }
  return (
    <>
      {currentSimulation && (
        <CurrentSimulationTracker currentSimulation={currentSimulation} />
      )}

      <Tutorial locale={locale} buttonNext={<ButtonNext />} />
    </>
  )
}
