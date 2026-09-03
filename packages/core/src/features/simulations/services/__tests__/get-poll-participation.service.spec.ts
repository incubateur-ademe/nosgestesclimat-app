import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { prisma } from '../../../../prisma/client.ts'
import { pollFactory } from '../../../polls/factories/poll.factory.ts'
import { userFactory } from '../../../users/factories/user.factory.ts'
import { simulationFactory } from '../../factories/simulation.factory.ts'
import { getPollParticipation } from '../get-poll-participation.service.ts'

vi.mock('../../helpers/migrate-simulation.ts', () => ({
  migrateSimulationIfNeeded: vi.fn((simulation) => simulation),
}))

describe('getPollParticipation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(async () => {
    await prisma.simulationPoll.deleteMany()
    await prisma.poll.deleteMany()
    await prisma.organisation.deleteMany()
    await prisma.simulation.deleteMany()
    await prisma.user.deleteMany()
  })

  it('returns null when the user has no simulation attached to the poll', async () => {
    const user = await userFactory.create()
    const poll = await pollFactory.create()

    const result = await getPollParticipation({
      userId: user.id,
      pollIdOrSlug: poll.id,
    })

    expect(result).toBeNull()
  })

  it('resolves the poll by id', async () => {
    const user = await userFactory.create()
    const poll = await pollFactory.create()
    const simulation = await simulationFactory
      .withModelRegion('FR')
      .withProgression(0.5)
      .withValidComputedResults()
      .params({ userId: user.id })
      .create()
    await attachToPoll({ simulationId: simulation.id, pollId: poll.id })

    const result = await getPollParticipation({
      userId: user.id,
      pollIdOrSlug: poll.id,
    })

    expect(result?.id).toBe(simulation.id)
  })

  it('resolves the poll by slug', async () => {
    const user = await userFactory.create()
    const poll = await pollFactory.create()
    const simulation = await simulationFactory
      .withModelRegion('FR')
      .withProgression(0.5)
      .withValidComputedResults()
      .params({ userId: user.id })
      .create()
    await attachToPoll({ simulationId: simulation.id, pollId: poll.id })

    const result = await getPollParticipation({
      userId: user.id,
      pollIdOrSlug: poll.slug,
    })

    expect(result?.id).toBe(simulation.id)
  })

  it('does not return a simulation attached to another poll', async () => {
    const user = await userFactory.create()
    const [poll, otherPoll] = await Promise.all([
      pollFactory.create(),
      pollFactory.create(),
    ])
    const simulation = await simulationFactory
      .withProgression(0.5)
      .withValidComputedResults()
      .params({ userId: user.id })
      .create()
    await attachToPoll({ simulationId: simulation.id, pollId: otherPoll.id })

    const result = await getPollParticipation({
      userId: user.id,
      pollIdOrSlug: poll.id,
    })

    expect(result).toBeNull()
  })

  it('does not return another user simulation', async () => {
    const [user, other] = await Promise.all([
      userFactory.create(),
      userFactory.create(),
    ])
    const poll = await pollFactory.create()
    const simulation = await simulationFactory
      .withProgression(0.5)
      .withValidComputedResults()
      .params({ userId: other.id })
      .create()
    await attachToPoll({ simulationId: simulation.id, pollId: poll.id })

    const result = await getPollParticipation({
      userId: user.id,
      pollIdOrSlug: poll.id,
    })

    expect(result).toBeNull()
  })

  it('returns the latest simulation attached to the poll, ordered by date', async () => {
    const user = await userFactory.create()
    const poll = await pollFactory.create()
    const [older, latest] = await Promise.all([
      simulationFactory
        .withModelRegion('FR')
        .withProgression(0.2)
        .withValidComputedResults()
        .params({
          userId: user.id,
          date: new Date('2024-01-01'),
        })
        .create(),
      simulationFactory
        .withModelRegion('FR')
        .withProgression(0.5)
        .withValidComputedResults()
        .params({
          userId: user.id,
          date: new Date('2024-02-01'),
        })
        .create(),
    ])
    await Promise.all([
      attachToPoll({ simulationId: older.id, pollId: poll.id }),
      attachToPoll({ simulationId: latest.id, pollId: poll.id }),
    ])

    const result = await getPollParticipation({
      userId: user.id,
      pollIdOrSlug: poll.id,
    })

    expect(result?.id).toBe(latest.id)
  })

  it('delegates migration to migrateSimulationIfNeeded', async () => {
    const { migrateSimulationIfNeeded } =
      await import('../../helpers/migrate-simulation.ts')
    const user = await userFactory.create()
    const poll = await pollFactory.create()
    const simulation = await simulationFactory
      .withModelRegion('FR')
      .withProgression(0.5)
      .withValidComputedResults()
      .params({ userId: user.id })
      .create()
    await attachToPoll({ simulationId: simulation.id, pollId: poll.id })

    await getPollParticipation({ userId: user.id, pollIdOrSlug: poll.id })

    expect(migrateSimulationIfNeeded).toHaveBeenCalledTimes(1)
    expect(migrateSimulationIfNeeded).toHaveBeenCalledWith(
      expect.objectContaining({ id: simulation.id, userId: user.id })
    )
  })
})

const attachToPoll = async ({
  simulationId,
  pollId,
}: {
  simulationId: string
  pollId: string
}) => {
  await prisma.simulationPoll.create({ data: { simulationId, pollId } })
}
