import { SIMULATION_URL } from '@/constants/urls/main'
import { getUser, type AppUser } from '../dal/user'
import { fetchServer } from '../fetchServer'
import { setDefaultExtendedSituation } from './utils/setDefaultExtendedSituation'

import type {
  DottedName,
  ExtendedSituation,
} from '@incubateur-ademe/nosgestesclimat'
import type {
  ComputedResults,
  Situation,
} from '../../../publicodes-state/types'

import { generateSimulation } from '@/helpers/simulation/generateSimulation'
import type supportedRegions from '@incubateur-ademe/nosgestesclimat/public/supportedRegions.json'

type Model = {
  [Region in keyof typeof supportedRegions]: `${Region & string}-${keyof (typeof supportedRegions)[Region] & string}-${string}`
}[keyof typeof supportedRegions]

export interface Simulation {
  id: string
  date: Date | string
  situation: Situation
  extendedSituation: ExtendedSituation
  foldedSteps: DottedName[]
  actionChoices: Partial<Record<DottedName, boolean>>
  persona?: string
  computedResults: ComputedResults
  progression: number
  model: Model
  user?: { id: string; name?: string }
  polls?: { id: string; slug: string }[]
  groups?: { id: string }[]
  updated_at: string
}

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
  user,
  simulationId,
}: {
  user: AppUser
  simulationId: string
}) {
  await fetchServer(`${SIMULATION_URL}/${user.id}/${simulationId}`, {
    method: 'DELETE',
  })
}

export async function createNewSimulation({
  user,
  simulation = generateSimulation(),
}: {
  user: AppUser
  simulation?: Simulation
}) {
  const serverSimulation = await fetchServer<Simulation>(
    `${SIMULATION_URL}/${user.id}`,
    {
      method: 'POST',
      body: simulation,
    }
  )

  return setDefaultExtendedSituation(serverSimulation)
}

export function isScolaire(simulation: Simulation) {
  return simulation.model.startsWith('ED')
}
