import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { prisma } from '../../../../prisma/client.ts'
import { userFactory } from '../../../users/factories/user.factory.ts'
import { simulationFactory } from '../../factories/simulation.factory.ts'
import { getLastCompletedSimulation } from '../get-last-completed-simulation.service.ts'

vi.mock('../../helpers/migrate-simulation.ts', () => ({
  migrateSimulationIfNeeded: vi.fn((simulation) => simulation),
}))

const validComputedResults = {
  carbone: {
    bilan: 1000,
    categories: {
      alimentation: 300,
      transport: 400,
      logement: 200,
      divers: 50,
      'services sociétaux': 50,
    },
    subcategories: {},
  },
  eau: {
    bilan: 500,
    categories: {
      alimentation: 150,
      transport: 200,
      logement: 100,
      divers: 25,
      'services sociétaux': 25,
    },
    subcategories: {},
  },
}

describe('getLastCompletedSimulation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(async () => {
    await prisma.simulationPoll.deleteMany()
    await prisma.groupParticipant.deleteMany()
    await prisma.group.deleteMany()
    await prisma.poll.deleteMany()
    await prisma.organisation.deleteMany()
    await prisma.simulation.deleteMany()
    await prisma.user.deleteMany()
  })

  it('returns null when the user has no simulations', async () => {
    const user = await userFactory.create()

    const result = await getLastCompletedSimulation({ userId: user.id })

    expect(result).toBeNull()
  })

  it('returns null when the user has only in-progress simulations', async () => {
    const user = await userFactory.create()
    await simulationFactory
      .withModelRegion('FR')
      .withProgression(0.5)
      .params({
        userId: user.id,
        date: new Date('2024-02-01'),
        computedResults: validComputedResults,
      })
      .create()

    const result = await getLastCompletedSimulation({ userId: user.id })

    expect(result).toBeNull()
  })

  it('returns the latest completed simulation ordered by date', async () => {
    const user = await userFactory.create()
    const [, latest] = await Promise.all([
      simulationFactory
        .withModelRegion('FR')
        .completed()
        .params({
          userId: user.id,
          date: new Date('2024-01-01'),
          computedResults: validComputedResults,
        })
        .create(),
      simulationFactory
        .withModelRegion('FR')
        .completed()
        .params({
          userId: user.id,
          date: new Date('2024-02-01'),
          computedResults: validComputedResults,
        })
        .create(),
    ])

    const result = await getLastCompletedSimulation({ userId: user.id })

    expect(result).toEqual({
      id: latest.id,
      date: latest.date,
      model: {
        region: 'FR',
        locale: 'fr',
        version: { publishedTag: expect.any(String) },
      },
      progression: 1,
      situation: {},
      extendedSituation: null,
      foldedSteps: [],
      actionChoices: {},
      computedResults: validComputedResults,
      createdAt: latest.createdAt,
      updatedAt: latest.updatedAt,
      userId: user.id,
      polls: [],
      groups: [],
    })
  })

  it('ignores a newer in-progress simulation and returns the latest completed one', async () => {
    const user = await userFactory.create()
    const [completed] = await Promise.all([
      simulationFactory
        .withModelRegion('FR')
        .completed()
        .params({
          userId: user.id,
          date: new Date('2024-01-01'),
          computedResults: validComputedResults,
        })
        .create(),
      simulationFactory
        .withModelRegion('FR')
        .withProgression(0.5)
        .params({
          userId: user.id,
          date: new Date('2024-02-01'),
          computedResults: validComputedResults,
        })
        .create(),
    ])

    const result = await getLastCompletedSimulation({ userId: user.id })

    expect(result).toEqual(
      expect.objectContaining({ id: completed.id, progression: 1 })
    )
  })

  it('does not return another user simulation', async () => {
    const [user, other] = await Promise.all([
      userFactory.create(),
      userFactory.create(),
    ])
    await simulationFactory
      .completed()
      .params({ userId: other.id, computedResults: validComputedResults })
      .create()

    const result = await getLastCompletedSimulation({ userId: user.id })

    expect(result).toBeNull()
  })

  it('returns null when the latest completed simulation has invalid computedResults', async () => {
    const user = await userFactory.create()
    await simulationFactory
      .completed()
      .withDeprecatedComputedResults()
      .params({ userId: user.id })
      .create()

    const result = await getLastCompletedSimulation({ userId: user.id })

    expect(result).toBeNull()
  })

  it('returns null when the model string cannot be parsed', async () => {
    const user = await userFactory.create()
    const simulation = await simulationFactory
      .completed()
      .params({ userId: user.id, computedResults: validComputedResults })
      .create()

    await prisma.simulation.update({
      where: { id: simulation.id },
      data: { model: 'FR-de-1.2.3' },
    })

    const result = await getLastCompletedSimulation({ userId: user.id })

    expect(result).toBeNull()
  })

  it('delegates migration to migrateSimulationIfNeeded', async () => {
    const { migrateSimulationIfNeeded } =
      await import('../../helpers/migrate-simulation.ts')
    const user = await userFactory.create()
    const simulation = await simulationFactory
      .withModelRegion('FR')
      .completed()
      .params({ userId: user.id, computedResults: validComputedResults })
      .create()

    await getLastCompletedSimulation({ userId: user.id })

    expect(migrateSimulationIfNeeded).toHaveBeenCalledTimes(1)
    expect(migrateSimulationIfNeeded).toHaveBeenCalledWith(
      expect.objectContaining({
        id: simulation.id,
        userId: user.id,
        situation: simulation.situation,
      })
    )
  })
})
