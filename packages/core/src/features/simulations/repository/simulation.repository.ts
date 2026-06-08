import { prisma } from '../../../prisma/client.ts'
import { SimulationNotFound } from '../exceptions/simulations.exception.ts'
import type { Simulation } from '../types/simulation.ts'
import { mapSimulation } from './simulation.mapper.ts'

export const getSimulationById = async (id: string): Promise<Simulation> => {
  const simulation = await prisma.simulation.findUnique({ where: { id } })

  if (!simulation) {
    throw new SimulationNotFound({ simulationId: id })
  }

  return mapSimulation(simulation)
}
