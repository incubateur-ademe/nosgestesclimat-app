'use server'

import { SIMULATION_URL } from '@/constants/urls/main'
import { MON_ESPACE_PATH } from '@/constants/urls/paths'
import type { Simulation } from '@/publicodes-state/types'
import { revalidatePath } from 'next/cache'
import { getUser, type AppUser } from '../dal/user'
import { fetchServer } from '../fetchServer'
import { setDefaultExtendedSituation } from './utils/setDefaultExtendedSituation'

interface SimulationFilter {
  completedOnly?: boolean
  pageSize?: number
}

export async function getSimulations(
  {
    user,
  }: {
    user: AppUser
  },
  { completedOnly = false, pageSize = 50 }: SimulationFilter = {}
): Promise<Simulation[]> {
  const serverSimulations = await fetchServer<Simulation[]>(
    `${SIMULATION_URL}/${user.id}?completedOnly=${completedOnly}&pageSize=${pageSize}`
  )

  // Map from server format to client format
  const simulations = serverSimulations.map((simulation) => {
    const updatedSimulation = setDefaultExtendedSituation(simulation)

    return updatedSimulation
  })

  return simulations
}

export async function getSimulation({
  user,
  simulationId,
}: {
  user: AppUser
  simulationId: string
}): Promise<Simulation> {
  const simulation = await fetchServer<Simulation>(
    `${SIMULATION_URL}/${user.id}/${simulationId}`
  )

  const updatedSimulation = setDefaultExtendedSituation(simulation)

  return updatedSimulation
}

export async function getUserSimulations(simulationFilter?: SimulationFilter) {
  const user = await getUser()
  return getSimulations({ user }, simulationFilter)
}

// This is a soft delete
export async function deleteSimulation({
  simulationId,
  userId,
}: {
  simulationId: string
  userId: string
}) {
  await fetchServer(`${SIMULATION_URL}/${userId}/${simulationId}`, {
    method: 'DELETE',
  })

  revalidatePath(MON_ESPACE_PATH)
  revalidatePath(`${MON_ESPACE_PATH}/resultats/${simulationId}`)
}
