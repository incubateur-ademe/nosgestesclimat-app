import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { prisma } from '../../../../prisma/client.ts'
import { groupFactory } from '../../../groups/factories/group.factory.ts'
import { pollFactory } from '../../../polls/factories/poll.factory.ts'
import { userFactory } from '../../../users/factories/user.factory.ts'
import { computedResultsFactory } from '../../factories/computed-results.factory.ts'
import { simulationFactory } from '../../factories/simulation.factory.ts'
import { getLatestSimulationResult } from '../get-latest-simulation-result.service.ts'

vi.mock('../../helpers/migrate-simulation.ts', () => ({
  migrateSimulationIfNeeded: vi.fn((simulation) => simulation),
}))

describe('getLatestSimulationResult', () => {
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

  it('returns null when the user has no completed simulations', async () => {
    const user = await userFactory.create()

    const result = await getLatestSimulationResult({
      userId: user.id,
      withTendency: false,
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
    })

    expect(result).toEqual(expect.objectContaining({ tendency: 'decrease' }))
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
    })

    expect(result?.group).toEqual({
      type: 'group',
      value: { id: group.id, name: group.name },
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
    })

    expect(result?.group).toEqual({
      type: 'poll',
      value: {
        id: poll.id,
        name: poll.name,
        slug: poll.slug,
        organisation: { slug: poll.organisation.slug },
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

    await getLatestSimulationResult({ userId: user.id, withTendency: false })

    expect(migrateSimulationIfNeeded).toHaveBeenCalledTimes(1)
    expect(migrateSimulationIfNeeded).toHaveBeenCalledWith(
      expect.objectContaining({ id: simulation.id, userId: user.id })
    )
  })
})
