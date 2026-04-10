import { SIMULATION_URL } from '@/constants/urls/main'
import type { Simulation } from '@/publicodes-state/types'
import { captureException } from '@sentry/nextjs'
import type { SaveSimulationPayload } from './saveSimulation'

export async function postSimulation({
  simulation,
  userId,
}: SaveSimulationPayload) {
  const url = new URL(`${SIMULATION_URL}/${userId}`)

  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(simulation),
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  let simulationSaved

  try {
    simulationSaved = (await response.json()) as Simulation
  } catch (error) {
    captureException(error)
    throw error
  }

  return simulationSaved
}
