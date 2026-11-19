import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { prisma } from '../../../../prisma/client.ts'
import { emptyDatabase } from '../../../../test-utils/empty-database.ts'
import { createTestLogger } from '../../../../test-utils/logger.ts'
import { groupFactory } from '../../../groups/factories/group.factory.ts'
import { pollFactory } from '../../../polls/factories/poll.factory.ts'
import { userFactory } from '../../../users/factories/user.factory.ts'
import { computedResultsFactory } from '../../factories/computed-results.factory.ts'
import { simulationFactory } from '../../factories/simulation.factory.ts'
import {
  evaluateRule,
  storeRule,
  zeroedCategories,
} from '../../test-utils/rule-evaluations.ts'
import type { ComputedResults } from '../../validators/computed-results.schema.ts'
import { getLatestSimulationResult } from '../get-latest-simulation-result.service.ts'

vi.mock('../../helpers/migrate-simulation.ts', () => ({
  migrateSimulationIfNeeded: vi.fn((simulation) => simulation),
}))

const logger = createTestLogger()

describe('getLatestSimulationResult', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(async () => {
    await emptyDatabase(prisma)
  })

  it('returns null when the user has no completed simulations', async () => {
    const user = await userFactory.create()

    const result = await getLatestSimulationResult({
      userId: user.id,
      withTendency: false,
      logger,
    })

    expect(result).toBeNull()
  })

  it('ignores in-progress simulations', async () => {
    const user = await userFactory.create()
    await simulationFactory
      .withModelRegion('FR')
      .withProgression(0.5)
      .withValidComputedResults()
      .params({ userId: user.id })
      .create()

    const result = await getLatestSimulationResult({
      userId: user.id,
      withTendency: false,
      logger,
    })

    expect(result).toBeNull()
  })

  it('returns a plain result for the latest completed simulation when withTendency is false', async () => {
    const user = await userFactory.create()
    const [, latest] = await Promise.all([
      simulationFactory
        .withModelRegion('FR')
        .completed()
        .withValidComputedResults()
        .params({ userId: user.id, date: new Date('2024-01-01') })
        .create(),
      simulationFactory
        .withModelRegion('FR')
        .completed()
        .withValidComputedResults()
        .params({ userId: user.id, date: new Date('2024-02-01') })
        .create(),
    ])

    const result = await getLatestSimulationResult({
      userId: user.id,
      withTendency: false,
      logger,
    })

    expect(result).toEqual(
      expect.objectContaining({
        tendency: null,
        group: null,
      })
    )
    expect(result?.simulation.id).toBe(latest.id)
  })

  it('does not compute a tendency when withTendency is false even if a previous simulation exists', async () => {
    const user = await userFactory.create()
    await Promise.all([
      simulationFactory
        .withModelRegion('FR')
        .completed()
        .withValidComputedResults()
        .params({ userId: user.id, date: new Date('2024-01-01') })
        .create(),
      simulationFactory
        .withModelRegion('FR')
        .completed()
        .withValidComputedResults()
        .params({ userId: user.id, date: new Date('2024-02-01') })
        .create(),
    ])

    const result = await getLatestSimulationResult({
      userId: user.id,
      withTendency: false,
      logger,
    })

    expect(result?.tendency).toBeNull()
  })

  it('returns an increasing tendency when the footprint went up', async () => {
    const user = await userFactory.create()
    await Promise.all([
      simulationFactory
        .withModelRegion('FR')
        .completed()
        .params({
          userId: user.id,
          date: new Date('2024-01-01'),
          computedResults: computedResultsFactory
            .valid()
            .withCarboneBilan(800)
            .build(),
        })
        .create(),
      simulationFactory
        .withModelRegion('FR')
        .completed()
        .params({
          userId: user.id,
          date: new Date('2024-02-01'),
          computedResults: computedResultsFactory
            .valid()
            .withCarboneBilan(1200)
            .build(),
        })
        .create(),
    ])

    const result = await getLatestSimulationResult({
      userId: user.id,
      withTendency: true,
      logger,
    })

    expect(result).toEqual(expect.objectContaining({ tendency: 'increase' }))
  })

  it('returns a decreasing tendency when the footprint went down', async () => {
    const user = await userFactory.create()
    await Promise.all([
      simulationFactory
        .withModelRegion('FR')
        .completed()
        .params({
          userId: user.id,
          date: new Date('2024-01-01'),
          computedResults: computedResultsFactory
            .valid()
            .withCarboneBilan(1200)
            .build(),
        })
        .create(),
      simulationFactory
        .withModelRegion('FR')
        .completed()
        .params({
          userId: user.id,
          date: new Date('2024-02-01'),
          computedResults: computedResultsFactory
            .valid()
            .withCarboneBilan(800)
            .build(),
        })
        .create(),
    ])

    const result = await getLatestSimulationResult({
      userId: user.id,
      withTendency: true,
      logger,
    })

    expect(result).toEqual(expect.objectContaining({ tendency: 'decrease' }))
  })

  it('displays the aggregate of the rule evaluations when it matches the stored column', async () => {
    const user = await userFactory.create()
    const column: ComputedResults = {
      carbone: {
        bilan: 1000,
        categories: { ...zeroedCategories(), transport: 400 },
        subcategories: { 'transport . voiture': 123.5 },
      },
      eau: { bilan: 500, categories: zeroedCategories(), subcategories: {} },
    }
    const simulation = await simulationFactory
      .withModelRegion('FR')
      .completed()
      .withCompletedComputation()
      .params({ userId: user.id, computedResults: column })
      .create()

    await evaluateRule(simulation, await storeRule('bilan', 'carbon'), {
      applicable: true,
      value: 1000,
    })
    await evaluateRule(simulation, await storeRule('bilan', 'water'), {
      applicable: true,
      value: 500,
    })
    await evaluateRule(simulation, await storeRule('transport', 'carbon'), {
      applicable: true,
      value: 400,
    })
    await evaluateRule(
      simulation,
      await storeRule('transport . voiture', 'carbon'),
      { applicable: true, value: 123.5 }
    )

    const result = await getLatestSimulationResult({
      userId: user.id,
      withTendency: false,
      logger,
    })

    expect(result?.simulation.computedResults).toEqual(column)
    expect(logger.warn).not.toHaveBeenCalled()
  })

  it('warns and falls back to the stored column when the latest simulation has no rule evaluations', async () => {
    const user = await userFactory.create()
    const simulation = await simulationFactory
      .withModelRegion('FR')
      .completed()
      .withFailedComputation()
      .withValidComputedResults()
      .params({ userId: user.id })
      .create()

    const result = await getLatestSimulationResult({
      userId: user.id,
      withTendency: false,
      logger,
    })

    expect(result?.simulation.computedResults).toEqual(
      simulation.computedResults
    )
    expect(logger.warn).toHaveBeenCalledTimes(1)
    expect(logger.warn).toHaveBeenCalledWith(expect.any(String), {
      simulationId: simulation.id,
      computationStatus: 'failed',
    })
  })

  it('warns once per differing leaf and prefers the stored column', async () => {
    const user = await userFactory.create()
    const stored: ComputedResults = {
      carbone: {
        bilan: 999,
        categories: { ...zeroedCategories(), transport: 400 },
        subcategories: { 'transport . voiture': 100 },
      },
      eau: { bilan: 500, categories: zeroedCategories(), subcategories: {} },
    }
    const simulation = await simulationFactory
      .withModelRegion('FR')
      .completed()
      .withCompletedComputation()
      .params({ userId: user.id, computedResults: stored })
      .create()

    await evaluateRule(simulation, await storeRule('bilan', 'carbon'), {
      applicable: true,
      value: 1000,
    })
    await evaluateRule(simulation, await storeRule('bilan', 'water'), {
      applicable: true,
      value: 500,
    })
    await evaluateRule(simulation, await storeRule('transport', 'carbon'), {
      applicable: true,
      value: 400,
    })
    await evaluateRule(
      simulation,
      await storeRule('transport . voiture', 'carbon'),
      { applicable: true, value: 123.5 }
    )

    const result = await getLatestSimulationResult({
      userId: user.id,
      withTendency: false,
      logger,
    })

    expect(result?.simulation.computedResults).toEqual(stored)
    expect(logger.warn).toHaveBeenCalledTimes(2)
    expect(logger.warn).toHaveBeenCalledWith(expect.any(String), {
      simulationId: simulation.id,
      path: 'carbone.bilan',
      aggregatedValue: 1000,
      storedValue: 999,
    })
    expect(logger.warn).toHaveBeenCalledWith(expect.any(String), {
      simulationId: simulation.id,
      path: 'carbone.subcategories[transport . voiture]',
      aggregatedValue: 123.5,
      storedValue: 100,
    })
  })

  it('resolves the previous simulation as well when withTendency is set', async () => {
    const user = await userFactory.create()
    const previous = await simulationFactory
      .withModelRegion('FR')
      .completed()
      .withValidComputedResults()
      .params({ userId: user.id, date: new Date('2024-01-01') })
      .create()
    const latest = await simulationFactory
      .withModelRegion('FR')
      .completed()
      .withValidComputedResults()
      .params({ userId: user.id, date: new Date('2024-02-01') })
      .create()

    const result = await getLatestSimulationResult({
      userId: user.id,
      withTendency: true,
      logger,
    })

    expect(result?.simulation.id).toBe(latest.id)
    expect(logger.warn).toHaveBeenCalledTimes(2)
    expect(logger.warn).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ simulationId: latest.id })
    )
    expect(logger.warn).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ simulationId: previous.id })
    )
  })

  it('resolves only the latest simulation when withTendency is false', async () => {
    const user = await userFactory.create()
    await simulationFactory
      .withModelRegion('FR')
      .completed()
      .withValidComputedResults()
      .params({ userId: user.id, date: new Date('2024-01-01') })
      .create()
    const latest = await simulationFactory
      .withModelRegion('FR')
      .completed()
      .withValidComputedResults()
      .params({ userId: user.id, date: new Date('2024-02-01') })
      .create()

    const result = await getLatestSimulationResult({
      userId: user.id,
      withTendency: false,
      logger,
    })

    expect(result?.simulation.id).toBe(latest.id)
    expect(logger.warn).toHaveBeenCalledTimes(1)
    expect(logger.warn).toHaveBeenCalledWith(expect.any(String), {
      simulationId: latest.id,
      computationStatus: null,
    })
  })

  it('computes the tendency from the resolved bilans', async () => {
    const user = await userFactory.create()
    const zeroedColumn = (bilan: number): ComputedResults => ({
      carbone: { bilan, categories: zeroedCategories(), subcategories: {} },
      eau: { bilan: 0, categories: zeroedCategories(), subcategories: {} },
    })
    const previous = await simulationFactory
      .withModelRegion('FR')
      .completed()
      .withCompletedComputation()
      .params({
        userId: user.id,
        date: new Date('2024-01-01'),
        computedResults: zeroedColumn(800),
      })
      .create()
    const latest = await simulationFactory
      .withModelRegion('FR')
      .completed()
      .withCompletedComputation()
      .params({
        userId: user.id,
        date: new Date('2024-02-01'),
        computedResults: zeroedColumn(1200),
      })
      .create()
    const bilanCarbon = await storeRule('bilan', 'carbon')
    await evaluateRule(previous, bilanCarbon, {
      applicable: true,
      value: 800,
    })
    await evaluateRule(latest, bilanCarbon, {
      applicable: true,
      value: 1200,
    })

    const result = await getLatestSimulationResult({
      userId: user.id,
      withTendency: true,
      logger,
    })

    expect(result?.simulation.computedResults.carbone.bilan).toBe(1200)
    expect(result?.tendency).toBe('increase')
    expect(logger.warn).not.toHaveBeenCalled()
  })

  it('returns a plain result when withTendency is true but there is no previous completed simulation', async () => {
    const user = await userFactory.create()
    const simulation = await simulationFactory
      .withModelRegion('FR')
      .completed()
      .withValidComputedResults()
      .params({ userId: user.id })
      .create()

    const result = await getLatestSimulationResult({
      userId: user.id,
      withTendency: true,
      logger,
    })

    expect(result).toEqual(
      expect.objectContaining({
        tendency: null,
      })
    )
    expect(result?.simulation.id).toBe(simulation.id)
  })

  it('does not return another user simulation', async () => {
    const [user, other] = await Promise.all([
      userFactory.create(),
      userFactory.create(),
    ])
    await simulationFactory
      .completed()
      .withValidComputedResults()
      .params({ userId: other.id })
      .create()

    const result = await getLatestSimulationResult({
      userId: user.id,
      withTendency: false,
      logger,
    })

    expect(result).toBeNull()
  })

  it('does not mix tendency computation across users', async () => {
    const [user, other] = await Promise.all([
      userFactory.create(),
      userFactory.create(),
    ])
    await Promise.all([
      simulationFactory
        .withModelRegion('FR')
        .completed()
        .withValidComputedResults()
        .params({ userId: other.id, date: new Date('2024-01-01') })
        .create(),
      simulationFactory
        .withModelRegion('FR')
        .completed()
        .withValidComputedResults()
        .params({ userId: other.id, date: new Date('2024-02-01') })
        .create(),
    ])
    const simulation = await simulationFactory
      .withModelRegion('FR')
      .completed()
      .withValidComputedResults()
      .params({ userId: user.id, date: new Date('2024-03-01') })
      .create()

    const result = await getLatestSimulationResult({
      userId: user.id,
      withTendency: true,
      logger,
    })

    expect(result).toEqual(expect.objectContaining({ tendency: null }))
    expect(result?.simulation.id).toBe(simulation.id)
  })

  it('resolves group info with type "group" when the latest simulation belongs to a group', async () => {
    const user = await userFactory.create()
    const group = await groupFactory.create()
    const simulation = await simulationFactory
      .withModelRegion('FR')
      .completed()
      .withValidComputedResults()
      .params({ userId: user.id })
      .create()
    await prisma.groupParticipant.create({
      data: { userId: user.id, simulationId: simulation.id, groupId: group.id },
    })

    const result = await getLatestSimulationResult({
      userId: user.id,
      withTendency: false,
      logger,
    })

    expect(result?.group).toEqual({
      type: 'group',
      value: group,
    })
  })

  it('resolves group info with type "poll" when the latest simulation belongs to a poll but no group', async () => {
    const user = await userFactory.create()
    const poll = await pollFactory.create()
    const simulation = await simulationFactory
      .withModelRegion('FR')
      .completed()
      .withValidComputedResults()
      .params({ userId: user.id })
      .create()
    await prisma.simulationPoll.create({
      data: { simulationId: simulation.id, pollId: poll.id },
    })

    const result = await getLatestSimulationResult({
      userId: user.id,
      withTendency: false,
      logger,
    })

    expect(result?.group).toEqual({
      type: 'poll',
      value: {
        id: poll.id,
        name: poll.name,
        slug: poll.slug,
        mode: poll.mode,
        organisation: {
          name: poll.organisation.name,
          slug: poll.organisation.slug,
        },
      },
    })
  })

  it('delegates migration to migrateSimulationIfNeeded', async () => {
    const { migrateSimulationIfNeeded } =
      await import('../../helpers/migrate-simulation.ts')
    const user = await userFactory.create()
    const simulation = await simulationFactory
      .withModelRegion('FR')
      .completed()
      .withValidComputedResults()
      .params({ userId: user.id })
      .create()

    await getLatestSimulationResult({
      userId: user.id,
      withTendency: false,
      logger,
    })

    expect(migrateSimulationIfNeeded).toHaveBeenCalledTimes(1)
    expect(migrateSimulationIfNeeded).toHaveBeenCalledWith(
      expect.objectContaining({ id: simulation.id, userId: user.id })
    )
  })
})
