'use server'
import { EMAIL_PAGE_PATH, END_PAGE_PATH } from '@/constants/urls/paths'
import { getUser } from '@/helpers/server/dal/user'
import { InternalServerError } from '@/helpers/server/error'
import { getLocaleFromHeaders } from '@/helpers/server/getLocaleForNotFoundOrUnautorizedPage'
import { saveSimulation } from '@/helpers/simulation/saveSimulation'
import type { Simulation } from '@/publicodes-state/types'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function endTestAction(simulation: Simulation, userName?: string) {
  revalidatePath(END_PAGE_PATH, 'layout')
  const locale = await getLocaleFromHeaders()
  const user = await getUser()
  if (simulation.progression !== 1) {
    throw new InternalServerError()
  }
  await saveSimulation({
    simulation,
    userId: user.id,
    name: userName,
    locale,
  })
  if (!user.isAuth && (simulation.polls?.length || simulation.groups?.length)) {
    redirect(EMAIL_PAGE_PATH)
  }
  redirect(END_PAGE_PATH)
}
