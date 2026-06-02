import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { prisma } from '../../../prisma/client.ts'

interface SimulationFixture {
  id: string
  userId: string | null
  progression: number
  createdAt: Date
}

class SimulationFactory extends Factory<SimulationFixture> {
  withComputationStatus(
    status: 'completed' | 'pending' | 'processing' | 'failed'
  ) {
    return this.afterCreate(async (data) => {
      const startedAt =
        status !== 'pending' ? faker.date.recent({ days: 1 }) : undefined
      const completedAt =
        (status === 'completed' || status === 'failed') && startedAt
          ? faker.date.between({ from: startedAt, to: new Date() })
          : undefined
      await prisma.simulationComputation.create({
        data: { simulationId: data.id, status, startedAt, completedAt },
      })
      return data
    })
  }

  withPendingComputation() {
    return this.withComputationStatus('pending')
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

  withCompletedComputation() {
    return this.withComputationStatus('completed')
  }

  started() {
    return this.params({ progression: 0.1 })
  }

  completed() {
    return this.params({ progression: 1 })
  }

  withFailedComputation() {
    return this.withComputationStatus('failed')
  }
}

export const simulationFactory = SimulationFactory.define(({ onCreate }) => {
  onCreate(async (data) => {
    await prisma.simulation.create({
      data: {
        id: data.id,
        date: new Date(),
        progression: data.progression,
        model: 'FR-fr-0.0.0',
        computedResults: {},
        situation: {},
        actionChoices: {},
        userId: data.userId,
        createdAt: data.createdAt,
      },
    })
    return data
  })

  return {
    id: faker.string.uuid(),
    userId: null,
    progression: 1,
    createdAt: new Date(),
  }
})
