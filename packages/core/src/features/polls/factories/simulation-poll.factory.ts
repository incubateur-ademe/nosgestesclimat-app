import { prisma } from '../../../prisma/client.ts'
import {
  SimulationFactory,
  simulationGenerator,
} from '../../simulations/factories/simulation.factory.ts'

export class SimulationPollFactory extends SimulationFactory {
  withPollId(pollId: string): this {
    return this.afterCreate(async (data) => {
      await prisma.simulationPoll.create({
        data: { pollId, simulationId: data.id },
      })
      return data
    })
  }
}

export const simulationPollFactory =
  SimulationPollFactory.define(simulationGenerator)
