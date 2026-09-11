import { afterEach, describe, expect, it, vi } from 'vitest'
import { success } from '../../../../lib/result.ts'
import { prisma } from '../../../../prisma/client.ts'
import type { AppUser } from '../../../auth/types/user-session.ts'
import { TemplateIds } from '../../../emails/email.constant.ts'
import { organisationFactory } from '../../../organisations/factories/organisation.factory.ts'
import { SimulationNotFoundError } from '../../../simulations/errors/simulations.error.ts'
import { simulationFactory } from '../../../simulations/factories/simulation.factory.ts'
import { emptyComputedResults } from '../../../simulations/helpers/empty-computed-results.ts'
import { findSimulationById } from '../../../simulations/repository/simulation.repository.ts'
import type { Model } from '../../../simulations/types/model.ts'
import { userFactory } from '../../../users/factories/user.factory.ts'
import { verifiedUserFactory } from '../../../users/factories/verified-user.factory.ts'
import { PollNotFoundError } from '../../errors/polls.error.ts'
import { pollFactory } from '../../factories/poll.factory.ts'
import { createPollParticipation } from '../../repositories/poll-participation.repository.ts'
import { createParticipateToPoll } from '../participate-to-poll.service.ts'

describe('participateToPoll', () => {
  afterEach(async () => {
    await prisma.simulationPoll.deleteMany()
    await prisma.poll.deleteMany()
    await prisma.organisation.deleteMany()
    await prisma.simulation.deleteMany()
    await prisma.verifiedUser.deleteMany()
    await prisma.user.deleteMany()
  })

  describe('starting a new simulation', () => {
    it('creates the simulation and enters it in the poll', async () => {
      const { participateToPoll } = setup()
      const user = await userFactory.create()
      const { poll } = await campaign()

      const result = await participateToPoll({
        userSession: unverified(user),
        pollId: poll.id,
        locale: 'fr',
        model,
      })

      expect(result).toEqual({
        success: true,
        data: { simulationId: expect.any(String) },
      })

      const { simulationId } = (result as { data: { simulationId: string } })
        .data
      expect(
        await findSimulationById({ id: simulationId, userId: user.id })
      ).toEqual({
        id: simulationId,
        date: expect.any(Date),
        model,
        progression: 0,
        situation: {},
        foldedSteps: [],
        computedResults: emptyComputedResults(),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        userId: user.id,
        polls: [{ id: poll.id, slug: poll.slug, name: poll.name }],
        groups: [],
      })
    })

    it('does not email when the simulation is not yet answered', async () => {
      const { participateToPoll, sendEmail, settleBackground } = setup()
      const user = await verifiedUser()
      const { poll } = await campaign()

      await participateToPoll({
        userSession: verified(user),
        pollId: poll.id,
        locale: 'fr',
        model,
      })
      await settleBackground()

      expect(sendEmail).not.toHaveBeenCalled()
    })
  })

  describe('reusing a completed simulation', () => {
    it('adds the membership without touching the simulation', async () => {
      const { participateToPoll } = setup()
      const user = await userFactory.create()
      const { poll } = await campaign()
      const simulation = await completedSimulation(user.id)

      const result = await participateToPoll({
        userSession: unverified(user),
        pollId: poll.id,
        locale: 'fr',
        reuseSimulationId: simulation.id,
      })

      expect(result).toEqual({
        success: true,
        data: { simulationId: simulation.id },
      })
      expect(
        await prisma.simulation.count({ where: { userId: user.id } })
      ).toBe(1)
      expect(
        await findSimulationById({ id: simulation.id, userId: user.id })
      ).toEqual(
        expect.objectContaining({
          progression: 1,
          updatedAt: simulation.updatedAt,
          situation: simulation.situation,
          polls: [{ id: poll.id, slug: poll.slug, name: poll.name }],
        })
      )
    })

    it('tells an authenticated user they joined the campaign', async () => {
      const { participateToPoll, sendEmail, settleBackground } = setup()
      const user = await verifiedUser()
      const { poll, organisation } = await campaign()
      const simulation = await completedSimulation(user.id)

      await participateToPoll({
        userSession: verified(user),
        pollId: poll.id,
        locale: 'fr',
        reuseSimulationId: simulation.id,
      })
      await settleBackground()

      expect(sendEmail).toHaveBeenCalledWith({
        email: user.email,
        templateId: TemplateIds.fr.ORGANISATION_JOINED,
        params: expect.objectContaining({
          ORGANISATION_NAME: organisation.name,
          DETAILED_VIEW_URL: expect.stringContaining(
            `/organisations/${organisation.slug}/campagnes/${poll.slug}`
          ),
          SIMULATION_URL: expect.stringContaining(`sid=${simulation.id}`),
        }),
      })
    })

    it('does not email an unverified user', async () => {
      const { participateToPoll, sendEmail, settleBackground } = setup()
      const user = await userFactory.create()
      const { poll } = await campaign()
      const simulation = await completedSimulation(user.id)

      await participateToPoll({
        userSession: unverified(user),
        pollId: poll.id,
        locale: 'fr',
        reuseSimulationId: simulation.id,
      })
      await settleBackground()

      expect(sendEmail).not.toHaveBeenCalled()
    })

    it('does not email when the user had already entered the poll', async () => {
      const { participateToPoll, sendEmail, settleBackground } = setup()
      const user = await verifiedUser()
      const { poll } = await campaign()
      const [first, second] = await Promise.all([
        completedSimulation(user.id),
        completedSimulation(user.id),
      ])
      await createPollParticipation({
        pollId: poll.id,
        simulationId: first.id,
      })

      await participateToPoll({
        userSession: verified(user),
        pollId: poll.id,
        locale: 'fr',
        reuseSimulationId: second.id,
      })
      await settleBackground()

      expect(sendEmail).not.toHaveBeenCalled()
      expect(
        await prisma.simulationPoll.count({ where: { pollId: poll.id } })
      ).toBe(2)
    })

    it('does not duplicate or email when the simulation is already in the poll', async () => {
      const { participateToPoll, sendEmail, settleBackground } = setup()
      const user = await verifiedUser()
      const { poll } = await campaign()
      const simulation = await completedSimulation(user.id)
      await createPollParticipation({
        pollId: poll.id,
        simulationId: simulation.id,
      })

      const result = await participateToPoll({
        userSession: verified(user),
        pollId: poll.id,
        locale: 'fr',
        reuseSimulationId: simulation.id,
      })
      await settleBackground()

      expect(result).toEqual({
        success: true,
        data: { simulationId: simulation.id },
      })
      expect(
        await prisma.simulationPoll.count({ where: { pollId: poll.id } })
      ).toBe(1)
      expect(sendEmail).not.toHaveBeenCalled()
    })

    it('does not email for a simulation still in progress', async () => {
      const { participateToPoll, sendEmail, settleBackground } = setup()
      const user = await verifiedUser()
      const { poll } = await campaign()
      const simulation = await simulationFactory
        .withModelRegion('FR')
        .withProgression(0.2)
        .params({ userId: user.id })
        .create()

      await participateToPoll({
        userSession: verified(user),
        pollId: poll.id,
        locale: 'fr',
        reuseSimulationId: simulation.id,
      })
      await settleBackground()

      expect(sendEmail).not.toHaveBeenCalled()
    })
  })

  describe('when it cannot be done', () => {
    it('fails with poll_not_found for an unknown poll', async () => {
      const { participateToPoll } = setup()
      const user = await userFactory.create()

      const result = await participateToPoll({
        userSession: unverified(user),
        pollId: '00000000-0000-0000-0000-000000000000',
        locale: 'fr',
        model,
      })

      expect(result).toEqual({ success: false, error: new PollNotFoundError() })
      expect(await prisma.simulation.count()).toBe(0)
    })

    it('fails with simulation_not_found for a simulation owned by another user', async () => {
      const { participateToPoll } = setup()
      const [user, other] = await Promise.all([
        userFactory.create(),
        userFactory.create(),
      ])
      const { poll } = await campaign()
      const simulation = await completedSimulation(other.id)

      const result = await participateToPoll({
        userSession: unverified(user),
        pollId: poll.id,
        locale: 'fr',
        reuseSimulationId: simulation.id,
      })

      expect(result).toEqual({
        success: false,
        error: new SimulationNotFoundError(),
      })
      expect(await prisma.simulationPoll.count()).toBe(0)
    })

    it('logs and reports an email that could not be sent', async () => {
      const {
        participateToPoll,
        sendEmail,
        logger,
        captureException,
        settleBackground,
      } = setup()
      const error = new Error('brevo is down')
      sendEmail.mockResolvedValue({ success: false, error })
      const user = await verifiedUser()
      const { poll } = await campaign()
      const simulation = await completedSimulation(user.id)

      const result = await participateToPoll({
        userSession: verified(user),
        pollId: poll.id,
        locale: 'fr',
        reuseSimulationId: simulation.id,
      })
      await settleBackground()

      // The membership is what the user asked for: a failed email does not
      // undo it.
      expect(result).toEqual({
        success: true,
        data: { simulationId: simulation.id },
      })
      expect(captureException).toHaveBeenCalledWith(error)
      expect(logger.error).toHaveBeenCalledWith(
        'Failed to send poll joined email',
        expect.objectContaining({ error, pollId: poll.id })
      )
    })
  })
})

const origin = 'https://nosgestesclimat.fr'

const setup = () => {
  const logger = {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  }
  const captureException = vi.fn()
  const sendEmail = vi.fn().mockResolvedValue(success())
  const backgroundTasks: Promise<void>[] = []
  const backgroundTaskRunner = vi.fn((task: () => Promise<void>) => {
    backgroundTasks.push(task())
  })

  return {
    logger,
    captureException,
    sendEmail,
    backgroundTaskRunner,
    participateToPoll: createParticipateToPoll({
      logger,
      captureException,
      sendEmail,
      origin,
      backgroundTaskRunner,
    }),
    settleBackground: () => Promise.all(backgroundTasks),
  }
}

const campaign = async () => {
  const organisation = await organisationFactory.create()
  const poll = await pollFactory.create(
    {},
    { transient: { organisationId: organisation.id } }
  )
  return { poll, organisation }
}

/**
 * An authenticated session belongs to either a verified or an unverified user.
 * Only a verified user exposes an email to the emails sent in background.
 */
const verifiedUser = async () => {
  const user = await userFactory.create()
  const { email } = await verifiedUserFactory.create({
    id: user.id,
    email: user.email!,
  })
  return { ...user, email }
}

const verified = (user: { id: string; email: string }): AppUser => ({
  id: user.id,
  email: user.email,
  isAuth: true,
})

const unverified = (user: { id: string }): AppUser => ({
  id: user.id,
  isAuth: false,
})

const completedSimulation = (userId: string) =>
  simulationFactory
    .withModelRegion('FR')
    .completed()
    .params({ userId })
    .create()

const model: Model = {
  region: 'FR',
  locale: 'fr',
  version: { publishedTag: '4.16.1' },
}
