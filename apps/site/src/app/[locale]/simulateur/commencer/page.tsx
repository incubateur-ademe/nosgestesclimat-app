import { SIMULATOR_PATH, TUTORIAL_PATH } from '@/constants/urls/paths'

import { getLinkToTutoriel } from '@/helpers/navigation/simulateurPages'
import { stringifyModel } from '@/helpers/server/model/models'
import type { Locale } from '@/i18nConfig'
import { getUserSession } from '@/services/auth/get-user-session'
import { createSimulation } from '@/services/simulations/create-simulation'
import { getUserSimulationProgress } from '@/services/simulations/get-user-simulation-progress'
import { resolveNewSimulationModel } from '@/services/simulations/resolve-new-simulation-model'
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

  const { currentSimulation } = await getUserSimulationProgress()

  const model = await resolveNewSimulationModel({
    searchParams: resolvedSearchParams,
    locale,
  })

  if (
    !currentSimulation ||
    currentSimulation.progression > 0 ||
    currentSimulation.model !== stringifyModel(model)
  ) {
    await createSimulation(model)
  }
  redirect(
    currentSimulation && currentSimulation.progression > 0
      ? SIMULATOR_PATH
      : TUTORIAL_PATH
  )
}
