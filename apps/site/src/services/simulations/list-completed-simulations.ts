'use server'

import { listCompletedSimulations as listCompletedSimulationsService } from '@nosgestesclimat/core/features/simulations/services/list-completed-simulations.service'

import { migrateSimulationIfNeeded } from '@/helpers/server/model/models'
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

  const dtos = simulations.map(toSimulationDto)

  const [lastSimulation, ...prev] = dtos
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!lastSimulation) {
    return dtos
  }
  const migratedLastSimulation = migrateSimulationIfNeeded(lastSimulation)
  return [migratedLastSimulation, ...prev]
}
