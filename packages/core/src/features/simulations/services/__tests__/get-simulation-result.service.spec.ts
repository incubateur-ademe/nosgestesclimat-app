import { randomUUID } from 'node:crypto'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { prisma } from '../../../../prisma/client.ts'
import { groupFactory } from '../../../groups/factories/group.factory.ts'
import { pollFactory } from '../../../polls/factories/poll.factory.ts'
import { userFactory } from '../../../users/factories/user.factory.ts'
import { simulationFactory } from '../../factories/simulation.factory.ts'
import { getSimulationResult } from '../get-simulation-result.service.ts'

vi.mock('../../helpers/migrate-simulation.ts', () => ({
  migrateSimulationIfNeeded: vi.fn((simulation) => simulation),
}))

describe('getSimulationResult', () => {
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

    const result = await getSimulationResult({
      id: randomUUID(),
      userId: user.id,
    })

    expect(result).toBeNull()
  })

  it('does not return a simulation belonging to another user', async () => {
    const [user, other] = await Promise.all([
      userFactory.create(),
      userFactory.create(),
    ])
    const simulation = await simulationFactory
      .withModelRegion('FR')
      .withValidComputedResults()
      .params({ userId: other.id })
      .create()

    const result = await getSimulationResult({
      id: simulation.id,
      userId: user.id,
    })

    expect(result).toBeNull()
  })

  it('returns a plain result with null group when the simulation has no group or poll', async () => {
    const user = await userFactory.create()
    const simulation = await simulationFactory
      .withModelRegion('FR')
      .withValidComputedResults()
      .params({ userId: user.id })
      .create()

    const result = await getSimulationResult({
      id: simulation.id,
      userId: user.id,
    })

    expect(result).toEqual(
      expect.objectContaining({
        tendency: null,
        group: null,
      })
    )
    expect(result?.simulation.id).toBe(simulation.id)
  })

  it('resolves group info with type "group" when the simulation belongs to a group', async () => {
    const user = await userFactory.create()
    const group = await groupFactory.create()
    const simulation = await simulationFactory
      .withModelRegion('FR')
      .withValidComputedResults()
      .params({ userId: user.id })
      .create()
    await prisma.groupParticipant.create({
      data: { userId: user.id, simulationId: simulation.id, groupId: group.id },
    })

    const result = await getSimulationResult({
      id: simulation.id,
      userId: user.id,
    })

    expect(result?.group).toEqual({
      type: 'group',
      value: { id: group.id, name: group.name },
    })
  })

  it('resolves group info with type "poll" when the simulation belongs to a poll but no group', async () => {
    const user = await userFactory.create()
    const poll = await pollFactory.create()
    const simulation = await simulationFactory
      .withModelRegion('FR')
      .withValidComputedResults()
      .params({ userId: user.id })
      .create()
    await prisma.simulationPoll.create({
      data: { simulationId: simulation.id, pollId: poll.id },
    })

    const result = await getSimulationResult({
      id: simulation.id,
      userId: user.id,
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
      .withValidComputedResults()
      .params({ userId: user.id })
      .create()

    await getSimulationResult({ id: simulation.id, userId: user.id })

    expect(migrateSimulationIfNeeded).toHaveBeenCalledTimes(1)
    expect(migrateSimulationIfNeeded).toHaveBeenCalledWith(
      expect.objectContaining({ id: simulation.id, userId: user.id })
    )
  })
})
