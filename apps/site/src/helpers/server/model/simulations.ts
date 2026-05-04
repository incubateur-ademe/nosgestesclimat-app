import { SIMULATION_URL } from '@/constants/urls/main'
import { generateSimulation } from '@/helpers/simulation/generateSimulation'
import type {
  DottedName,
  ExtendedSituation,
} from '@incubateur-ademe/nosgestesclimat'
import type {
  ComputedResults,
  Situation,
} from '../../../publicodes-state/types'
import { type AppUser } from '../dal/user'
import { fetchServer } from '../fetchServer'
import {
  migrateSimulationIfNeeded,
  stringifyModel,
  type Model,
  type ModelString,
} from './models'
import { setDefaultExtendedSituation } from './utils/setDefaultExtendedSituation'

export type SimulationMode = 'scolaire' | 'standard'

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
  model: ModelString
  user?: { id: string; name?: string }
  polls?: { id: string; slug: string }[]
  groups?: { id: string }[]
  updated_at: string
}

interface SimulationFilter {
  completedOnly?: boolean
  pageSize?: number
}

async function fetchSimulations(
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
    delete updatedSimulation.user
    return updatedSimulation
  })

  // We only migrate the most recent simulation
  const [lastSimulation, ...prev] = simulations
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!lastSimulation) {
    return simulations
  }
  const migratedLastSimulation = migrateSimulationIfNeeded(lastSimulation)
  return [migratedLastSimulation, ...prev]
}

export async function getCurrentSimulation({
  user,
}: {
  user: AppUser
}): Promise<Simulation | undefined> {
  const simulations = await fetchSimulations({ user }, { pageSize: 1 })
  return simulations.at(0)
}

export async function getCompletedSimulations(
  {
    user,
  }: {
    user: AppUser
  },
  { pageSize }: SimulationFilter = {}
): Promise<Simulation[]> {
  return fetchSimulations({ user }, { completedOnly: true, pageSize })
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
  delete updatedSimulation.user

  return updatedSimulation
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
  model,
}: {
  user: AppUser
  model: Model
}): Promise<void> {
  const simulation = generateSimulation({ model: stringifyModel(model) })
  await fetchServer<Simulation>(`${SIMULATION_URL}/${user.id}`, {
    method: 'POST',
    body: simulation,
  })
}

export function getSimulationMode(simulation: Simulation): SimulationMode {
  return simulation.model.startsWith('ED') ? 'scolaire' : 'standard'
}
