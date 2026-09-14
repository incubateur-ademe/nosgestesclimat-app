import { randomUUID } from 'node:crypto'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { prisma } from '../../../../prisma/client.ts'
import { userFactory } from '../../../users/factories/user.factory.ts'
import { computedResultsFactory } from '../../factories/computed-results.factory.ts'
import { simulationFactory } from '../../factories/simulation.factory.ts'
import { getSimulation } from '../get-simulation.service.ts'

vi.mock('../../helpers/migrate-simulation.ts', () => ({
  migrateSimulationIfNeeded: vi.fn((simulation) => simulation),
}))

describe('getSimulation', () => {
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

  it('returns null when the simulation does not exist', async () => {
    const user = await userFactory.create()

    const result = await getSimulation({ id: randomUUID(), userId: user.id })

    expect(result).toBeNull()
  })

  it('returns the simulation matching the id', async () => {
    const user = await userFactory.create()
    const simulation = await simulationFactory
      .withModelRegion('FR')
      .withProgression(0.5)
      .withValidComputedResults()
      .params({
        userId: user.id,
      })
      .create()

    const result = await getSimulation({ id: simulation.id, userId: user.id })

    expect(result).toEqual({
      id: simulation.id,
      date: simulation.date,
      model: {
        region: 'FR',
        locale: 'fr',
        version: { publishedTag: expect.any(String) },
      },
      progression: 0.5,
      situation: {},
      foldedSteps: [],
      computedResults: computedResultsFactory.valid().build(),
      createdAt: simulation.createdAt,
      updatedAt: simulation.updatedAt,
      userId: user.id,
      polls: [],
      groups: [],
    })
  })

  it('does not return a simulation belonging to another user', async () => {
    const [user, other] = await Promise.all([
      userFactory.create(),
      userFactory.create(),
    ])
    const simulation = await simulationFactory
      .withProgression(0.5)
      .withValidComputedResults()
      .params({ userId: other.id })
      .create()

    const result = await getSimulation({ id: simulation.id, userId: user.id })

    expect(result).toBeNull()
  })

  it('returns null when the simulation has invalid computedResults', async () => {
    const user = await userFactory.create()
    const simulation = await simulationFactory
      .withProgression(0.5)
      .withDeprecatedComputedResults()
      .params({ userId: user.id })
      .create()

    const result = await getSimulation({ id: simulation.id, userId: user.id })

    expect(result).toBeNull()
  })

  it('returns null when the model string cannot be parsed', async () => {
    const user = await userFactory.create()
    const simulation = await simulationFactory
      .withProgression(0.5)
      .withValidComputedResults()
      .params({ userId: user.id })
      .create()

    await prisma.simulation.update({
      where: { id: simulation.id },
      data: { model: 'FR-de-1.2.3' },
    })

    const result = await getSimulation({ id: simulation.id, userId: user.id })

    expect(result).toBeNull()
  })

  it('hydrates polls and groups when present', async () => {
    const user = await userFactory.create()
    const simulation = await simulationFactory
      .withModelRegion('FR')
      .withProgression(0.5)
      .withValidComputedResults()
      .params({ userId: user.id })
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

    const result = await getSimulation({ id: simulation.id, userId: user.id })

    expect(result).toEqual(
      expect.objectContaining({
        polls: [{ id: poll.id, slug: 'test-poll', name: 'Test Poll' }],
        groups: [{ id: group.id }],
      })
    )
  })

  it('delegates migration to migrateSimulationIfNeeded', async () => {
    const { migrateSimulationIfNeeded } =
      await import('../../helpers/migrate-simulation.ts')
    const user = await userFactory.create()
    const simulation = await simulationFactory
      .withModelRegion('FR')
      .withProgression(0.5)
      .withValidComputedResults()
      .params({ userId: user.id })
      .create()

    await getSimulation({ id: simulation.id, userId: user.id })

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
