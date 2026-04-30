import { TUTORIAL_PATH } from '@/constants/urls/paths'
import { getUser } from '@/helpers/server/dal/user'
import {
  createNewSimulation,
  getSimulations,
} from '@/helpers/server/model/simulations'
import { redirect } from 'next/navigation'

export default async function Commencer() {
  const user = await getUser()
  const currentSimulation = (
    await getSimulations({ user }, { pageSize: 1 })
  ).at(0)

  if (!currentSimulation || currentSimulation.progression > 0) {
    await createNewSimulation({ user })
  }
  redirect(TUTORIAL_PATH)
}
