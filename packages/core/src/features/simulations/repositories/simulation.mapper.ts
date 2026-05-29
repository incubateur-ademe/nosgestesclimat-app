import type { Prisma } from '../../../prisma/generated/client.ts'
import { getEmptyComputedResults } from '../helpers/get-empty-computed-results.ts'
import type {
  NewSimulation,
  Simulation,
  UpdatedSimulation,
} from '../types/simulation.ts'
import type { SimulationDB } from './simulation.repository.ts'

export const mapSimulation = (db: SimulationDB): Simulation => ({
  id: db.id,
  date: db.date,
  model: db.model,
  progression: db.progression,
  computedResults: (db.computedResults ??
    getEmptyComputedResults()) as Simulation['computedResults'],
  situation: db.situation as Simulation['situation'],
  extendedSituation: db.extendedSituation as Simulation['extendedSituation'],
  foldedSteps: db.foldedSteps as string[],
  createdAt: db.createdAt,
  updatedAt: db.updatedAt,
  userId: db.userId,
})

export const mapNewSimulationToPrisma = (
  simulation: NewSimulation,
  userId: string
): Prisma.SimulationCreateInput => ({
  id: simulation.id,
  model: simulation.model,
  user: {
    connect: { id: userId },
  },
  actionChoices: '{}',
  date: new Date(),
  situation: simulation.situation as Prisma.InputJsonValue,
  foldedSteps: simulation.foldedSteps,
  progression: simulation.progression,
  computedResults:
    simulation.computedResults as unknown as Prisma.InputJsonValue,
  extendedSituation: simulation.extendedSituation as
    | Prisma.InputJsonValue
    | undefined,
  states: {
    create: {
      date: new Date(),
      progression: simulation.progression,
    },
  },
})

export const mapUpdatedSimulationToPrisma = (
  simulation: UpdatedSimulation
): Prisma.SimulationUpdateInput => ({
  model: simulation.model,
  situation: simulation.situation as Prisma.InputJsonValue,
  foldedSteps: simulation.foldedSteps,
  progression: simulation.progression,
  computedResults:
    simulation.computedResults as unknown as Prisma.InputJsonValue,
  extendedSituation: simulation.extendedSituation as Prisma.InputJsonValue,
  states: {
    create: {
      date: new Date(),
      progression: simulation.progression,
    },
  },
})
