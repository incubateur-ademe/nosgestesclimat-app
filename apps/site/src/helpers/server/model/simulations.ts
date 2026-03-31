'use server'

import { SIMULATION_URL } from '@/constants/urls/main'
import { MON_ESPACE_PATH } from '@/constants/urls/paths'
import { getInitialExtendedSituation } from '@/helpers/modelFetching/getInitialExtendedSituation'
import { mapNewSimulationToOld } from '@/helpers/simulation/mapNewSimulation'
import type { Simulation as ClientSimulation } from '@/publicodes-state/types'
import type { Simulation as ServerSimulation } from '@/types/organisations'
import { revalidatePath } from 'next/cache'
import { fetchServer } from './fetchServer'

export async function getUserSimulations({
  userId,
}: {
  userId: string
}): Promise<ClientSimulation[]> {
  const serverSimulations = await fetchServer<ServerSimulation[]>(
    `${SIMULATION_URL}/${userId}?pageSize=50`
  )

  // Map from server format to client format
  const simulations = serverSimulations.map((simulation) => {
    const mappedSimulation = mapNewSimulationToOld(simulation)

    // Ensure extendedSituation is always defined (for old simulations that might not have it)
    if (!mappedSimulation.extendedSituation) {
      mappedSimulation.extendedSituation = getInitialExtendedSituation()
    }

    return mappedSimulation
  })

  const sortedSimulations = simulations.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
  return sortedSimulations
}

// This is a soft delete
export async function deleteSimulation({
  simulationId,
  userId,
}: {
  simulationId: string
  userId: string
}) {
  await fetchServer(`${SIMULATION_URL}/${userId}/${simulationId}/delete`, {
    method: 'DELETE',
  })

  revalidatePath(MON_ESPACE_PATH)
  revalidatePath(`${MON_ESPACE_PATH}/resultats/${simulationId}`)
}
