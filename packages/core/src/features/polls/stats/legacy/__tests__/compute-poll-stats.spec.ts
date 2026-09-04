import { afterEach, describe, expect, it, vi } from 'vitest'
import { prisma } from '../../../../../prisma/client.ts'
import { organisationFactory } from '../../../../organisations/factories/organisation.factory.ts'
import { pollFactory } from '../../../factories/poll.factory.ts'
import { simulationPollFactory } from '../../../factories/simulation-poll.factory.ts'
import { createComputePollStats } from '../compute-poll-stats.ts'

const logger = {
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
  debug: vi.fn(),
}

const computePollStats = createComputePollStats({ logger })

describe('computePollStats', () => {
  afterEach(async () => {
    await prisma.simulationPoll.deleteMany()
    await prisma.poll.deleteMany()
    await prisma.simulation.deleteMany()
    await prisma.organisation.deleteMany()
  })

  it('sums computedResults across valid simulations and ignores invalid ones', async () => {
    const organisation = await organisationFactory.create()
    const poll = await pollFactory.create({ organisationId: organisation.id })

    const validSimulation1 = await simulationPollFactory
      .completed()
      .withPollId(poll.id)
      .create()
    const validSimulation2 = await simulationPollFactory
      .completed()
      .withPollId(poll.id)
      .create()
    await simulationPollFactory.started().withPollId(poll.id).create()

    const { computedResults } = await computePollStats(poll.id)

    expect(computedResults.carbone.bilan).toBe(
      validSimulation1.computedResults.carbone.bilan +
        validSimulation2.computedResults.carbone.bilan
    )
  })

  it('derives fun facts from the situation', async () => {
    const organisation = await organisationFactory.create()
    const poll = await pollFactory.create({ organisationId: organisation.id })

    await simulationPollFactory
      .completed()
      .params({
        situation: {
          'transport . voiture . km': 12000,
          'transport . mobilité douce . vélo . présent': 'oui',
        },
      })
      .withPollId(poll.id)
      .create()

    const { funFacts } = await computePollStats(poll.id)

    expect(funFacts.averageOfCarKilometers).toBe(12000)
    expect(funFacts.percentageOfBicycleUsers).toBe(100)
  })
})
