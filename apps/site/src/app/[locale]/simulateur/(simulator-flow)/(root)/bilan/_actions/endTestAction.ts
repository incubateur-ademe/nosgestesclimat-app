'use server'
import { EMAIL_PAGE_PATH, END_PAGE_PATH } from '@/constants/urls/paths'
import { getUser } from '@/helpers/server/dal/user'
import { InternalServerError } from '@/helpers/server/error'
import type { Simulation } from '@/helpers/server/model/simulations'
import { getSimulationResult } from '@nosgestesclimat/core/features/simulations/services/get-simulation-result.service'
import { saveSimulation } from '@nosgestesclimat/core/features/simulations/services/save-simulation.service'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function endTestAction(simulation: Simulation) {
  revalidatePath(END_PAGE_PATH, 'layout')

  if (simulation.progression !== 1) {
    throw new InternalServerError()
  }
  const user = await getUser()
  await saveSimulation(user.id, simulation)
  const result = await getSimulationResult(user.id)
  if (!user.isAuth && (result.poll || result.group)) {
    redirect(EMAIL_PAGE_PATH)
  }
  redirect(END_PAGE_PATH)
}
