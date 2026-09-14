'use server'

import { SIMULATOR_PATH } from '@/constants/urls/paths'
import { ensureUserSession } from '@/services/auth/ensure-user-session'
import { getCurrentSimulation } from '@/services/simulations/get-current-simulation'
import { resolveNewSimulationModel } from '@/services/simulations/resolve-new-simulation-model'
import { startSimulation as startSimulationService } from '@nosgestesclimat/core/features/simulations/services/start-simulation.service'
import type { SearchParams } from 'next/dist/server/request/search-params'
import { redirect } from 'next/navigation'

export async function startSimulation(searchParams?: SearchParams) {
  const current = await getCurrentSimulation()
  if (current) {
    redirect(SIMULATOR_PATH)
  }

  // The tutorial is where a first-time visitor writes something for the first
  // time: they need an identity before the simulation can belong to anyone.
  const session = await ensureUserSession()

  const model = await resolveNewSimulationModel({ searchParams })
  await startSimulationService({ userId: session.id, model })
  redirect(SIMULATOR_PATH)
}
