import { SIMULATOR_PATH, TUTORIAL_PATH } from '@/constants/urls/paths'
import { getUser } from '@/helpers/server/dal/user'
import { stringifyModel } from '@/helpers/server/model/models'
import {
  createNewSimulation,
  getCurrentSimulation,
} from '@/helpers/server/model/simulations'
import type { Locale } from '@/i18nConfig'
import { redirect } from 'next/navigation'
import { getNewSimulationModelService } from '../_service/getNewSimulationModelService'

export default async function Commencer({
  searchParams,
  params,
}: PageProps<'/[locale]/simulateur/commencer'>) {
  const user = await getUser()
  const currentSimulation = await getCurrentSimulation({ user })

  const locale = (await params).locale as Locale
  const model = await getNewSimulationModelService({ searchParams, locale })

  if (
    !currentSimulation ||
    currentSimulation.progression > 0 ||
    currentSimulation.model !== stringifyModel(model)
  ) {
    await createNewSimulation({
      user,
      model,
    })
  }
  redirect(
    currentSimulation && currentSimulation.progression > 0
      ? SIMULATOR_PATH
      : TUTORIAL_PATH
  )
}
