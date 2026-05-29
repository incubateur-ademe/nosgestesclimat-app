import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { prisma } from '../../../prisma/client.ts'
import type { Prisma } from '../../../prisma/generated/client.ts'
import type { ComputedResult } from '../types/computed-result.ts'

interface SimulationFixture {
  id: string
  userId: string
  model: string
  progression: number
  computedResults: ComputedResult
  situation: Record<string, unknown>
  extendedSituation: null
  foldedSteps: string[]
}

class SimulationFactory extends Factory<SimulationFixture> {
  withProgression(progression: number) {
    return this.params({ progression })
  }

  withComputedResults(computedResults: ComputedResult) {
    return this.params({ computedResults })
  }
}

export const createUser = async () => {
  const id = faker.string.uuid()
  await prisma.user.create({ data: { id } })
  return id
}

export const simulationFactory = SimulationFactory.define(({ onCreate }) => {
  onCreate(async (data) => {
    await prisma.user.create({ data: { id: data.userId } })

    await prisma.simulation.create({
      data: {
        id: data.id,
        date: new Date(),
        model: data.model,
        progression: data.progression,
        computedResults:
          data.computedResults as unknown as Prisma.InputJsonValue,
        situation: data.situation as Prisma.InputJsonValue,
        extendedSituation: data.extendedSituation as unknown as
          | Prisma.InputJsonValue
          | undefined,
        foldedSteps: data.foldedSteps,
        actionChoices: '{}',
        userId: data.userId,
      },
    })

    await prisma.simulationState.create({
      data: {
        simulationId: data.id,
        date: new Date(),
        progression: data.progression,
      },
    })

    return data
  })

  return {
    id: faker.string.uuid(),
    userId: faker.string.uuid(),
    model: 'FR-fr-1.0.0',
    progression: 1,
    computedResults: {
      carbone: {
        bilan: 10000,
        categories: {
          alimentation: 2000,
          transport: 3000,
          logement: 2500,
          divers: 1500,
          'services sociétaux': 1000,
        },
        subcategories: {},
      },
      eau: {
        bilan: 100,
        categories: {
          alimentation: 20,
          transport: 30,
          logement: 25,
          divers: 15,
          'services sociétaux': 10,
        },
        subcategories: {},
      },
    },
    situation: { 'logement . surface': 50 },
    extendedSituation: null,
    foldedSteps: [],
  }
})
