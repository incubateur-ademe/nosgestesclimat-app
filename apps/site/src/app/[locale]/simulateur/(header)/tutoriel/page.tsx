import CurrentSimulationTracker from '@/components/tracking/CurrentSimulationTracker'
import { SIMULATOR_PATH } from '@/constants/urls/paths'

import { getUserSimulationJourney } from '@/services/simulations/get-user-simulation-journey'
import {
  hasCompletedSimulation,
  hasCurrentSimulationInProgress,
} from '@nosgestesclimat/core/features/simulations/helpers/user-simulation-journey'
import { redirect } from 'next/navigation'
import Tutorial from '../_components/Tutorial'
import ButtonNext from './_components/ButtonNext'

export default async function TutorielPage({
  params,
  searchParams,
}: PageProps<'/[locale]/simulateur/tutoriel'>) {
  const { locale } = await params
  const resolvedSearchParams = await searchParams

  const journey = await getUserSimulationJourney()
  const { currentSimulation } = journey

  if (
    hasCurrentSimulationInProgress(journey) ||
    hasCompletedSimulation(journey)
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
