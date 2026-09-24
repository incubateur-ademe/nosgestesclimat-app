import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { success } from '../../../../lib/result.ts'
import { prisma } from '../../../../prisma/client.ts'
import { simulationFactory } from '../../../simulations/factories/simulation.factory.ts'
import { userFactory } from '../../../users/factories/user.factory.ts'
import { pollFactory } from '../../factories/poll.factory.ts'
import { getPollParticipationOptions } from '../get-poll-participation-options.service.ts'
import { createParticipateToPoll } from '../participate-to-poll.service.ts'

vi.mock('../../../simulations/helpers/migrate-simulation.ts', () => ({
  migrateSimulationIfNeeded: vi.fn((simulation) => simulation),
}))

const SIX_MONTHS_MS = 6 * 30 * 24 * 3600 * 1000

describe('getPollParticipationOptions', () => {
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

  it('does not offer to reuse a simulation when the user has none', async () => {
    const user = await userFactory.create()
    const poll = await pollFactory.create()

    const result = await getPollParticipationOptions({ poll, userId: user.id })

    expect(result).toEqual({
      currentPollSimulation: null,
      canReuseExistingSimulation: false,
    })
  })

  it('returns the user existing participation to this poll without offering reuse another simulation', async () => {
    const user = await userFactory.create()
    const poll = await pollFactory.create()
    const simulation = await simulationFactory
      .withModelRegion('FR')
      .withProgression(0.5)
      .withValidComputedResults()
      .params({ userId: user.id })
      .create()
    await participateToPoll({
      userId: user.id,
      pollId: poll.id,
      simulationId: simulation.id,
    })

    const result = await getPollParticipationOptions({ poll, userId: user.id })

    expect(result.canReuseExistingSimulation).toBe(false)
    expect(result.currentPollSimulation?.id).toBe(simulation.id)
  })

  it('does not offer to reuse a completed simulation when the user already started one for this poll', async () => {
    const user = await userFactory.create()
    const poll = await pollFactory.create()
    const pollSimulation = await simulationFactory
      .withModelRegion('FR')
      .withProgression(0.5)
      .withValidComputedResults()
      .params({ userId: user.id, date: new Date('2024-06-01') })
      .create()
    await participateToPoll({
      userId: user.id,
      pollId: poll.id,
      simulationId: pollSimulation.id,
    })
    await simulationFactory
      .withModelRegion('FR')
      .completed()
      .withValidComputedResults()
      .params({ userId: user.id, date: new Date('2024-05-01') })
      .create()

    const result = await getPollParticipationOptions({ poll, userId: user.id })

    expect(result.canReuseExistingSimulation).toBe(false)
    expect(result.currentPollSimulation?.id).toBe(pollSimulation.id)
    // completedSimulation should not appear as reusable
    expect(
      'reusableSimulation' in result ? result.reusableSimulation.id : null
    ).toBeNull()
  })

  it('offers to reuse the user latest completed simulation when eligible', async () => {
    const user = await userFactory.create()
    const poll = await pollFactory.create()
    const completedSimulation = await simulationFactory
      .withModelRegion('FR')
      .completed()
      .withValidComputedResults()
      .params({ userId: user.id, date: new Date() })
      .create()

    const result = await getPollParticipationOptions({ poll, userId: user.id })

    expect.assert(result.canReuseExistingSimulation)
    expect(result.reusableSimulation.id).toBe(completedSimulation.id)
    expect(result.reusableSimulationPolls).toEqual([])
    expect(result.currentPollSimulation).toBeNull()
  })

  it('includes the polls the reusable simulation already belongs to, regardless of order', async () => {
    const user = await userFactory.create()
    const poll = await pollFactory.create()
    const otherPoll = await pollFactory.create()
    const completedSimulation = await simulationFactory
      .withModelRegion('FR')
      .completed()
      .withValidComputedResults()
      .params({ userId: user.id, date: new Date() })
      .create()
    await participateToPoll({
      userId: user.id,
      pollId: otherPoll.id,
      simulationId: completedSimulation.id,
    })

    const result = await getPollParticipationOptions({ poll, userId: user.id })

    expect.assert(result.canReuseExistingSimulation)
    expect(result.reusableSimulationPolls.map((poll) => poll.id)).toContain(
      otherPoll.id
    )
  })

  it('does not offer reuse for a scolaire poll', async () => {
    const user = await userFactory.create()
    const poll = await pollFactory.scolaire().create()
    await simulationFactory
      .withModelRegion('FR')
      .completed()
      .withValidComputedResults()
      .params({ userId: user.id, date: new Date() })
      .create()

    const result = await getPollParticipationOptions({ poll, userId: user.id })

    expect(result.canReuseExistingSimulation).toBe(false)
  })

  it('does not offer reuse when the completed simulation was done in scolaire mode', async () => {
    const user = await userFactory.create()
    const poll = await pollFactory.create()
    await simulationFactory
      .withModelRegion('ED')
      .completed()
      .withValidComputedResults()
      .params({ userId: user.id, date: new Date() })
      .create()

    const result = await getPollParticipationOptions({ poll, userId: user.id })

    expect(result.canReuseExistingSimulation).toBe(false)
  })

  it('does not offer reuse when the completed simulation is older than 6 months', async () => {
    const user = await userFactory.create()
    const poll = await pollFactory.create()
    await simulationFactory
      .withModelRegion('FR')
      .completed()
      .withValidComputedResults()
      .params({
        userId: user.id,
        date: new Date(Date.now() - SIX_MONTHS_MS - 24 * 3600 * 1000),
      })
      .create()

    const result = await getPollParticipationOptions({ poll, userId: user.id })

    expect(result.canReuseExistingSimulation).toBe(false)
  })

  it('migrates both the poll simulation and the reusable simulation', async () => {
    const { migrateSimulationIfNeeded } =
      await import('../../../simulations/helpers/migrate-simulation.ts')
    const user = await userFactory.create()
    const poll = await pollFactory.create()
    const pollSimulation = await simulationFactory
      .withModelRegion('FR')
      .withProgression(0.5)
      .withValidComputedResults()
      .params({ userId: user.id })
      .create()
    await participateToPoll({
      userId: user.id,
      pollId: poll.id,
      simulationId: pollSimulation.id,
    })
    await simulationFactory
      .withModelRegion('FR')
      .completed()
      .withValidComputedResults()
      .params({ userId: user.id })
      .create()

    await getPollParticipationOptions({ poll, userId: user.id })

    expect(migrateSimulationIfNeeded).toHaveBeenCalledTimes(2)
  })
})

const participateToPollService = createParticipateToPoll({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn() },
  captureException: vi.fn(),
  sendEmail: vi.fn().mockResolvedValue(success()),
  origin: 'https://nosgestesclimat.fr',
  backgroundTaskRunner: vi.fn(),
})

const participateToPoll = ({
  userId,
  pollId,
  simulationId,
}: {
  userId: string
  pollId: string
  simulationId: string
}) =>
  participateToPollService({
    userSession: { id: userId, isAuth: false },
    pollId,
    locale: 'fr',
    reuseSimulationId: simulationId,
  })
