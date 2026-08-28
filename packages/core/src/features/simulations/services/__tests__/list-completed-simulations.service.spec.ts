import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { prisma } from '../../../../prisma/client.ts'
import { userFactory } from '../../../users/factories/user.factory.ts'
import { simulationFactory } from '../../factories/simulation.factory.ts'
import { listCompletedSimulations } from '../list-completed-simulations.service.ts'

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

describe('listCompletedSimulations', () => {
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

  it('returns an empty array when the user has no simulations', async () => {
    const user = await userFactory.create()

    const result = await listCompletedSimulations({ userId: user.id })

    expect(result).toEqual([])
  })

  it('returns an empty array when the user has only in-progress simulations', async () => {
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

    const result = await listCompletedSimulations({ userId: user.id })

    expect(result).toEqual([])
  })

  it('returns completed simulations ordered by date descending', async () => {
    const user = await userFactory.create()
    const [older, newer] = await Promise.all([
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

    const result = await listCompletedSimulations({ userId: user.id })

    expect(result).toEqual([
      {
        id: newer.id,
        date: newer.date,
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
        createdAt: newer.createdAt,
        updatedAt: newer.updatedAt,
        userId: user.id,
        polls: [],
        groups: [],
      },
      expect.objectContaining({ id: older.id, progression: 1 }),
    ])
  })

  it('ignores in-progress simulations and returns only completed ones', async () => {
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

    const result = await listCompletedSimulations({ userId: user.id })

    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(completed.id)
  })

  it('does not return another user simulations', async () => {
    const [user, other] = await Promise.all([
      userFactory.create(),
      userFactory.create(),
    ])
    await simulationFactory
      .completed()
      .params({ userId: other.id, computedResults: validComputedResults })
      .create()

    const result = await listCompletedSimulations({ userId: user.id })

    expect(result).toEqual([])
  })

  it('respects the limit', async () => {
    const user = await userFactory.create()
    await Promise.all([
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
      simulationFactory
        .withModelRegion('FR')
        .completed()
        .params({
          userId: user.id,
          date: new Date('2024-03-01'),
          computedResults: validComputedResults,
        })
        .create(),
    ])

    const result = await listCompletedSimulations({
      userId: user.id,
      limit: 2,
    })

    expect(result).toHaveLength(2)
  })

  it('defaults the limit to 10 when none is provided', async () => {
    const user = await userFactory.create()
    await Promise.all(
      Array.from({ length: 11 }, () =>
        simulationFactory
          .withModelRegion('FR')
          .completed()
          .params({
            userId: user.id,
            date: new Date('2024-01-01'),
            computedResults: validComputedResults,
          })
          .create()
      ).map((promise, i) =>
        promise.then((simulation) =>
          prisma.simulation.update({
            where: { id: simulation.id },
            data: { date: new Date(2024, 0, 1 + i) },
          })
        )
      )
    )

    const result = await listCompletedSimulations({ userId: user.id })

    expect(result).toHaveLength(10)
  })

  it('filters out simulations with invalid computedResults', async () => {
    const user = await userFactory.create()
    await simulationFactory
      .completed()
      .withDeprecatedComputedResults()
      .params({ userId: user.id })
      .create()

    const result = await listCompletedSimulations({ userId: user.id })

    expect(result).toEqual([])
  })

  it('filters out simulations whose model string cannot be parsed', async () => {
    const user = await userFactory.create()
    const simulation = await simulationFactory
      .completed()
      .params({ userId: user.id, computedResults: validComputedResults })
      .create()

    await prisma.simulation.update({
      where: { id: simulation.id },
      data: { model: 'FR-de-1.2.3' },
    })

    const result = await listCompletedSimulations({ userId: user.id })

    expect(result).toEqual([])
  })

  it('delegates migration to migrateSimulationIfNeeded only for the most recent simulation', async () => {
    const { migrateSimulationIfNeeded } =
      await import('../../helpers/migrate-simulation.ts')
    const user = await userFactory.create()
    const [older, newer] = await Promise.all([
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

    await listCompletedSimulations({ userId: user.id })

    expect(migrateSimulationIfNeeded).toHaveBeenCalledTimes(1)
    expect(migrateSimulationIfNeeded).toHaveBeenCalledWith(
      expect.objectContaining({
        id: newer.id,
        situation: newer.situation,
      })
    )
    expect(migrateSimulationIfNeeded).not.toHaveBeenCalledWith(
      expect.objectContaining({
        id: older.id,
        situation: older.situation,
      })
    )
  })
})
