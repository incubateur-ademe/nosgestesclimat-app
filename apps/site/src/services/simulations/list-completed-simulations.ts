'use server'

import { listCompletedSimulations as listCompletedSimulationsService } from '@nosgestesclimat/core/features/simulations/services/list-completed-simulations.service'

import type { Simulation } from '@/helpers/server/model/simulations'
import { getUserSession } from '@/services/auth/get-user-session'
import { toSimulationDto } from './simulation.dto'

export const listCompletedSimulations = async ({
  limit,
}: { limit?: number } = {}): Promise<Simulation[]> => {
  const session = await getUserSession()
  if (!session) return []

  const simulations = await listCompletedSimulationsService({
    userId: session.id,
    limit,
  })

  return simulations.map(toSimulationDto)
}
