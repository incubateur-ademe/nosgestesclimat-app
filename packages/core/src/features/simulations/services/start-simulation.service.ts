import { newSimulation } from '../helpers/new-simulation.ts'
import { createSimulation } from '../repository/simulation.repository.ts'
import type { Model } from '../types/model.ts'

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
