import { prisma } from '../../../prisma/client.ts'
import type { SimulationModel } from '../../../prisma/generated/models/Simulation.ts'

export const findSimulationById = async (
  simulationId: string
): Promise<Pick<SimulationModel, 'id' | 'situation' | 'userId'>> =>
  prisma.simulation.findUniqueOrThrow({
    where: { id: simulationId },
    select: {
      id: true,
      situation: true,
      userId: true,
    },
  })
