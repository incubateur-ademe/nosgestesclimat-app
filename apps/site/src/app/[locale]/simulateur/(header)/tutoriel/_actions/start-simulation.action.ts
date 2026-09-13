'use server'

import { SIMULATOR_PATH } from '@/constants/urls/paths'
import { createSimulation } from '@/services/simulations/create-simulation'
import { getCurrentSimulation } from '@/services/simulations/get-current-simulation'
import { resolveNewSimulationModel } from '@/services/simulations/resolve-new-simulation-model'
import type { SearchParams } from 'next/dist/server/request/search-params'
import { redirect } from 'next/navigation'

export async function startSimulation(searchParams?: SearchParams) {
  const current = await getCurrentSimulation()
  if (current) {
    redirect(SIMULATOR_PATH)
  }

  const model = await resolveNewSimulationModel({ searchParams })
  await createSimulation(model)
  redirect(SIMULATOR_PATH)
}
