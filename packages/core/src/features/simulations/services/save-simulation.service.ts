import {
  ImmutableSimulationException,
  NotAuthorizedSimulationException,
  SimulationNotFoundException,
} from '../exceptions/simulation.exception.ts'
import {
  findSimulationById,
  updateSimulation,
} from '../repositories/simulation.repository.ts'
import type { NewSimulation, Simulation } from '../types/simulation.ts'

export const saveSimulation = async (
  userId: string,
  simulation: NewSimulation
): Promise<Simulation> => {
  const simulationId = simulation.id
  const previousSimulation = await findSimulationById(simulationId)
  if (!previousSimulation) {
    throw new SimulationNotFoundException({ simulationId })
  }
  if (previousSimulation.userId !== userId) {
    throw new NotAuthorizedSimulationException({ simulationId })
  }
  if (previousSimulation.progression === 1 && simulation.progression !== 1) {
    throw new ImmutableSimulationException({ simulationId })
  }

  return updateSimulation(simulationId, simulation)
}
