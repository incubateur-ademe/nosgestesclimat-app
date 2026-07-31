'use server'

import { SIMULATION_URL } from '@/constants/urls/main'
import { fetchServer } from '@/helpers/server/fetchServer'
import { migrateSimulationIfNeeded } from '@/helpers/server/model/models'
import type { Simulation } from '@/helpers/server/model/simulations'
import { setDefaultExtendedSituation } from '@/helpers/server/model/utils/setDefaultExtendedSituation'
import { getUserSession } from '@/services/auth/get-user-session'

interface SimulationFilter {
  completedOnly?: boolean
  pageSize?: number
}

export const getSimulations = async ({
  completedOnly = false,
  pageSize = 50,
}: SimulationFilter = {}): Promise<Simulation[]> => {
  const session = await getUserSession()
  if (!session) return []

  const serverSimulations = await fetchServer<Simulation[]>(
    `${SIMULATION_URL}?completedOnly=${completedOnly}&pageSize=${pageSize}`
  )

  const simulations = serverSimulations.map((simulation) => {
    const updatedSimulation = setDefaultExtendedSituation(simulation)
    delete updatedSimulation.user
    return updatedSimulation
  })

  const [lastSimulation, ...prev] = simulations
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!lastSimulation) {
    return simulations
  }
  const migratedLastSimulation = migrateSimulationIfNeeded(lastSimulation)
  return [migratedLastSimulation, ...prev]
}
