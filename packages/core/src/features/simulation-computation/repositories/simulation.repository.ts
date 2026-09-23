import { prisma } from '../../../prisma/client.ts'
import { SimulationNotFoundError } from '../../simulations/errors/simulations.error.ts'
import type { Simulation } from '../../simulations/types/simulation.ts'
import { mapSimulation } from './simulation.mapper.ts'

export const getSimulationById = async (id: string): Promise<Simulation> => {
  const simulation = await prisma.simulation.findUnique({ where: { id } })

  if (!simulation) {
    throw new SimulationNotFoundError(id)
  }

  return mapSimulation(simulation)
}
