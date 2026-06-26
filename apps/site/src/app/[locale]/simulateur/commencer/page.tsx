import { SIMULATOR_PATH, TUTORIAL_PATH } from '@/constants/urls/paths'

import { stringifyModel } from '@/helpers/server/model/models'
import type { Locale } from '@/i18nConfig'
import { getUserSession } from '@/services/auth/get-user-session'
import { createSimulation } from '@/services/simulations/create-simulation'
import { getCurrentSimulation } from '@/services/simulations/get-current-simulation'
import { redirect } from 'next/navigation'
import { getNewSimulationModelService } from '../_service/getNewSimulationModelService'

export default async function Commencer({
  searchParams,
  params,
}: PageProps<'/[locale]/simulateur/commencer'>) {
  const session = await getUserSession()
  if (!session) {
    redirect(TUTORIAL_PATH)
  }

  const currentSimulation = await getCurrentSimulation()

  const locale = (await params).locale as Locale
  const model = await getNewSimulationModelService({ searchParams, locale })

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
