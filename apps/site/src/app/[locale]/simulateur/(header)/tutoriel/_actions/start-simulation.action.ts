'use server'

import { SIMULATOR_PATH } from '@/constants/urls/paths'
import { createSimulation } from '@/services/simulations/create-simulation'
import { getCurrentSimulation } from '@/services/simulations/get-current-simulation'
import { resolveNewSimulationModel } from '@/services/simulations/resolve-new-simulation-model'
import { redirect } from 'next/navigation'

export async function startSimulation() {
  const current = await getCurrentSimulation()
  if (current) {
    redirect(SIMULATOR_PATH)
  }

  const model = await resolveNewSimulationModel()
  await createSimulation(model)
  redirect(SIMULATOR_PATH)
}
