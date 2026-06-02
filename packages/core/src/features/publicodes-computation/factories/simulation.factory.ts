import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { prisma } from '../../../prisma/client.ts'

interface SimulationFixture {
  id: string
}

class SimulationFactory extends Factory<SimulationFixture> {
  withPendingComputation() {
    return this.afterCreate(async (data) => {
      await prisma.simulationComputation.create({
        data: {
          simulationId: data.id,
          status: 'pending',
        },
      })
      return data
    })
  }

  withStaleProcessingComputation() {
    return this.afterCreate(async (data) => {
      await prisma.simulationComputation.create({
        data: {
          simulationId: data.id,
          status: 'processing',
          startedAt: new Date(Date.now() - 60_000),
        },
      })
      return data
    })
  }
}

export const simulationFactory = SimulationFactory.define(({ onCreate }) => {
  onCreate(async (data) => {
    await prisma.simulation.create({
      data: {
        id: data.id,
        date: new Date(),
        progression: 1,
        model: 'FR-fr-0.0.0',
        computedResults: {},
        situation: {},
        actionChoices: {},
      },
    })
    return data
  })

  return {
    id: faker.string.uuid(),
  }
})
