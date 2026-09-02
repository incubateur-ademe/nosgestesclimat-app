import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { prisma } from '../../../../prisma/client.ts'
import { userFactory } from '../../../users/factories/user.factory.ts'
import { simulationFactory } from '../../factories/simulation.factory.ts'
import { getCurrentSimulation } from '../get-current-simulation.service.ts'

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

describe('getCurrentSimulation', () => {
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

    const result = await getCurrentSimulation({ userId: user.id })

    expect(result).toBeNull()
  })

  it('returns the latest simulation ordered by date', async () => {
    const user = await userFactory.create()
    const [, latest] = await Promise.all([
      simulationFactory
        .withModelRegion('FR')
        .withProgression(0.2)
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

    const result = await getCurrentSimulation({ userId: user.id })

    expect(result).toEqual({
      id: latest.id,
      date: latest.date,
      model: {
        region: 'FR',
        locale: 'fr',
        version: { publishedTag: expect.any(String) },
      },
      progression: 0.5,
      situation: {},
      foldedSteps: [],
      computedResults: validComputedResults,
      createdAt: latest.createdAt,
      updatedAt: latest.updatedAt,
      userId: user.id,
      polls: [],
      groups: [],
    })
  })

  it('does not return another user simulation', async () => {
    const [user, other] = await Promise.all([
      userFactory.create(),
      userFactory.create(),
    ])
    await simulationFactory
      .withProgression(0.5)
      .params({ userId: other.id, computedResults: validComputedResults })
      .create()

    const result = await getCurrentSimulation({ userId: user.id })

    expect(result).toBeNull()
  })

  it('returns null when the latest simulation has invalid computedResults', async () => {
    const user = await userFactory.create()
    await simulationFactory
      .withProgression(0.5)
      .withDeprecatedComputedResults()
      .params({ userId: user.id })
      .create()

    const result = await getCurrentSimulation({ userId: user.id })

    expect(result).toBeNull()
  })

  it('returns null when the model string cannot be parsed', async () => {
    const user = await userFactory.create()
    const simulation = await simulationFactory
      .withProgression(0.5)
      .params({ userId: user.id, computedResults: validComputedResults })
      .create()

    await prisma.simulation.update({
      where: { id: simulation.id },
      data: { model: 'FR-de-1.2.3' },
    })

    const result = await getCurrentSimulation({ userId: user.id })

    expect(result).toBeNull()
  })

  it('hydrates polls and groups when present', async () => {
    const user = await userFactory.create()
    const simulation = await simulationFactory
      .withModelRegion('FR')
      .withProgression(0.5)
      .params({ userId: user.id, computedResults: validComputedResults })
      .create()

    const organisation = await prisma.organisation.create({
      data: { name: 'Test Org', slug: 'test-org' },
    })
    const poll = await prisma.poll.create({
      data: {
        name: 'Test Poll',
        slug: 'test-poll',
        organisationId: organisation.id,
        customAdditionalQuestions: [],
      },
    })
    await prisma.simulationPoll.create({
      data: { pollId: poll.id, simulationId: simulation.id },
    })

    const group = await prisma.group.create({
      data: { name: 'Test Group', emoji: '🌍' },
    })
    await prisma.groupParticipant.create({
      data: {
        userId: user.id,
        simulationId: simulation.id,
        groupId: group.id,
      },
    })

    const result = await getCurrentSimulation({ userId: user.id })

    expect(result).toEqual(
      expect.objectContaining({
        polls: [{ id: poll.id, slug: 'test-poll', name: 'Test Poll' }],
        groups: [{ id: group.id }],
      })
    )
  })

  it('serializes the model back to a string-compatible entity', async () => {
    const user = await userFactory.create()
    const simulation = await simulationFactory
      .withModelRegion('FR')
      .withProgression(0.5)
      .params({ userId: user.id, computedResults: validComputedResults })
      .create()

    const result = await getCurrentSimulation({ userId: user.id })

    expect(result).toEqual(expect.objectContaining({ model: simulation.model }))
  })

  it('delegates migration to migrateSimulationIfNeeded', async () => {
    const { migrateSimulationIfNeeded } =
      await import('../../helpers/migrate-simulation.ts')
    const user = await userFactory.create()
    const simulation = await simulationFactory
      .withModelRegion('FR')
      .withProgression(0.5)
      .params({ userId: user.id, computedResults: validComputedResults })
      .create()

    await getCurrentSimulation({ userId: user.id })

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
