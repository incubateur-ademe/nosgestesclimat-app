import { faker } from '@faker-js/faker'
import { prisma } from '../../../prisma/client.ts'
import {
  SimulationFactory,
  simulationGenerator,
} from '../../simulations/factories/simulation.factory.ts'

export class SimulationComputationFactory extends SimulationFactory {
  withComputationStatus(
    status: 'completed' | 'pending' | 'processing' | 'failed'
  ): this {
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

  withPendingComputation(): this {
    return this.withComputationStatus('pending')
  }

  withStaleProcessingComputation(): this {
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

  withCompletedComputation(): this {
    return this.withComputationStatus('completed')
  }

  withFailedComputation(): this {
    return this.withComputationStatus('failed')
  }
}

export const simulationComputationFactory =
  SimulationComputationFactory.define(simulationGenerator)
