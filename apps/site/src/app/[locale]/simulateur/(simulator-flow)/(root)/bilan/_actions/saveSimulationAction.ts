'use server'

import { getUser } from '@/helpers/server/dal/user'
import { saveSimulation } from '@nosgestesclimat/core/features/simulations/services/save-simulation.service'
import type { UpdatedSimulation } from '@nosgestesclimat/core/features/simulations/types/simulation'

export async function saveSimulationAction(simulation: UpdatedSimulation) {
  const user = await getUser()
  return saveSimulation(user.id, simulation)
}
