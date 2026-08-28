import CurrentSimulationTracker from '@/components/tracking/CurrentSimulationTracker'
import { SIMULATOR_PATH } from '@/constants/urls/paths'

import { getUserSimulationProgress } from '@/services/simulations/get-user-simulation-progress'
import { redirect } from 'next/navigation'
import Tutorial from '../_components/Tutorial'
import ButtonNext from './_components/ButtonNext'

export default async function TutorielPage({
  params,
  searchParams,
}: PageProps<'/[locale]/simulateur/tutoriel'>) {
  const { locale } = await params
  const resolvedSearchParams = await searchParams

  const { currentSimulation, completedSimulation } =
    await getUserSimulationProgress()

  if (
    (currentSimulation && currentSimulation.progression > 0) ||
    completedSimulation
  ) {
    redirect(SIMULATOR_PATH)
  }
  return (
    <>
      {currentSimulation && (
        <CurrentSimulationTracker currentSimulation={currentSimulation} />
      )}

      <Tutorial
        locale={locale}
        buttonNext={<ButtonNext searchParams={resolvedSearchParams} />}
      />
    </>
  )
}
