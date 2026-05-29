import { prisma } from '../../../prisma/client.ts'
import type { SimulationModel } from '../../../prisma/generated/models.ts'
import type { Simulation, UpdatedSimulation } from '../types/simulation.ts'

import {
  mapSimulation,
  mapUpdatedSimulationToPrisma,
} from './simulation.mapper.ts'

const select = {
  id: true,
  date: true,
  model: true,
  progression: true,
  computedResults: true,
  actionChoices: true,
  situation: true,
  extendedSituation: true,
  foldedSteps: true,
  createdAt: true,
  updatedAt: true,
  userId: true,
}
export type SimulationDB = Pick<SimulationModel, keyof typeof select>

export const findSimulationById = async (
  id: string
): Promise<Simulation | null> => {
  const result = await prisma.simulation.findUnique({
    where: { id },
    select,
  })
  return result ? mapSimulation(result) : null
}

export const updateSimulation = async (
  id: string,
  simulation: UpdatedSimulation
): Promise<Simulation> => {
  const result = await prisma.simulation.update({
    where: { id },
    data: mapUpdatedSimulationToPrisma(simulation),
  })
  return mapSimulation(result)
}
