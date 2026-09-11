'use server'

import type { Model } from '@/helpers/server/model/models'
import { getUserSession } from '@/services/auth/get-user-session'
import { startSimulation as startSimulationService } from '@nosgestesclimat/core/features/simulations/services/start-simulation.service'
import { unauthorized } from 'next/navigation'

/**
 * Starts a new simulation for the current user. Callers reached by a visitor
 * without a session must mint one first with `ensureUserSession`.
 */
export const startSimulation = async (
  model: Model
): Promise<{ simulationId: string }> => {
  const session = await getUserSession()
  if (!session) unauthorized()

  return await startSimulationService({ userId: session.id, model })
}
