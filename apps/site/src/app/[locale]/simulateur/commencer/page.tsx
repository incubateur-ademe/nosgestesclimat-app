import { SIMULATOR_PATH, TUTORIAL_PATH } from '@/constants/urls/paths'

import { getLinkToTutoriel } from '@/helpers/navigation/simulateurPages'
import { stringifyModel } from '@/helpers/server/model/models'
import type { Locale } from '@/i18nConfig'
import { getUserSession } from '@/services/auth/get-user-session'
import { createSimulation } from '@/services/simulations/create-simulation'
import { getUserSimulationJourney } from '@/services/simulations/get-user-simulation-journey'
import { resolveNewSimulationModel } from '@/services/simulations/resolve-new-simulation-model'
import {
  hasCompletedCurrentSimulation,
  hasCurrentSimulationInProgress,
  hasSimulation,
} from '@nosgestesclimat/core/features/simulations/helpers/user-simulation-journey'
import { redirect } from 'next/navigation'

export default async function Commencer({
  searchParams,
  params,
}: PageProps<'/[locale]/simulateur/commencer'>) {
  const session = await getUserSession()
  const locale = (await params).locale as Locale
  const resolvedSearchParams = await searchParams
  if (!session) {
    const tutorielSearchParams = new URLSearchParams()
    for (const [key, value] of Object.entries(resolvedSearchParams)) {
      if (typeof value === 'string') {
        tutorielSearchParams.set(key, value)
      }
    }
    redirect(getLinkToTutoriel({ locale, searchParams: tutorielSearchParams }))
  }

  const journey = await getUserSimulationJourney()

  const model = await resolveNewSimulationModel({
    searchParams: resolvedSearchParams,
    locale,
  })

  if (
    journey.currentSimulation?.model !== stringifyModel(model) ||
    !hasSimulation(journey) ||
    hasCurrentSimulationInProgress(journey) ||
    hasCompletedCurrentSimulation(journey)
  ) {
    await createSimulation(model)
  }
  redirect(
    hasCurrentSimulationInProgress(journey) ||
      hasCompletedCurrentSimulation(journey)
      ? SIMULATOR_PATH
      : TUTORIAL_PATH
  )
}
