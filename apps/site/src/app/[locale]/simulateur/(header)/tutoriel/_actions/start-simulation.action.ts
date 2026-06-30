'use server'

import { SIMULATOR_PATH } from '@/constants/urls/paths'
import { createSimulation } from '@/services/simulations/create-simulation'
import { getCurrentSimulation } from '@/services/simulations/get-current-simulation'
import { redirect } from 'next/navigation'
import { getNewSimulationModelService } from '../../../_service/getNewSimulationModelService'

export async function startSimulation() {
  const current = await getCurrentSimulation()
  if (current) {
    redirect(SIMULATOR_PATH)
  }

  const model = await getNewSimulationModelService()
  await createSimulation(model)
  redirect(SIMULATOR_PATH)
}
