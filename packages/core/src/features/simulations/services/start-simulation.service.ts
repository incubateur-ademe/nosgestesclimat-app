import type { Model } from '../../models/types/model.ts'
import { newSimulation } from '../helpers/new-simulation.ts'
import { createSimulation } from '../repository/simulation.repository.ts'

/**
 * Starts a new simulation for a user that already exists.
 */
export const startSimulation = async ({
  userId,
  model,
}: {
  userId: string
  model: Model
}): Promise<{ simulationId: string }> => {
  const simulation = newSimulation({ userId, model })

  await createSimulation(simulation)

  return { simulationId: simulation.id }
}
