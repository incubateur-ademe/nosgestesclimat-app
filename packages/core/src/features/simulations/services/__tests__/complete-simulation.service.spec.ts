import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { success } from '../../../../lib/result.ts'
import { prisma } from '../../../../prisma/client.ts'
import type { AppUser } from '../../../auth/types/user-session.ts'
import { Attributes, TemplateIds } from '../../../emails/email.constant.ts'
import { EmailRequestError } from '../../../emails/errors.ts'
import { groupFactory } from '../../../groups/factories/group.factory.ts'
import { organisationFactory } from '../../../organisations/factories/organisation.factory.ts'
import { pollFactory } from '../../../polls/factories/poll.factory.ts'
import { ComputationAlreadyExistsError } from '../../../simulation-computation/errors/simulation-computation.error.ts'
import { findSimulationComputation } from '../../../simulation-computation/repositories/simulation-computations.repository.ts'
import { userFactory } from '../../../users/factories/user.factory.ts'
import { verifiedUserFactory } from '../../../users/factories/verified-user.factory.ts'
import {
  SimulationCompletedError,
  SimulationIncompleteError,
  SimulationNotFoundError,
  ZeroFootprintError,
} from '../../errors/simulations.error.ts'
import { simulationFactory } from '../../factories/simulation.factory.ts'
import { findSimulationById } from '../../repository/simulation.repository.ts'
import type { ComputedResults } from '../../validators/computed-results.schema.ts'
import { createCompleteSimulation } from '../complete-simulation.service.ts'

describe('completeSimulation', () => {
  afterEach(async () => {
    await prisma.simulationComputation.deleteMany()
    await prisma.simulationPoll.deleteMany()
    await prisma.groupParticipant.deleteMany()
    await prisma.groupAdministrator.deleteMany()
    await prisma.group.deleteMany()
    await prisma.poll.deleteMany()
    await prisma.organisation.deleteMany()
    await prisma.simulation.deleteMany()
    await prisma.verifiedUser.deleteMany()
    await prisma.user.deleteMany()
  })

  it('persists the answers and returns the groups and polls the simulation belongs to', async () => {
    const { completeSimulation } = setup()
    const user = await verifiedUser()
    const simulation = await startedSimulation(user.id)
    const { poll } = await joinPoll(simulation.id)
    const group = await joinGroup({ simulationId: simulation.id, user })

    const result = await completeSimulation({
      userSession: authenticated(user),
      simulationId: simulation.id,
      ...payload,
    })

    expect(result).toEqual({
      success: true,
      data: {
        groups: [{ id: group.id }],
        polls: [{ id: poll.id, slug: poll.slug, name: poll.name }],
      },
    })

    const updated = await findSimulationById({
      id: simulation.id,
      userId: user.id,
    })

    expect(updated).toEqual({
      id: simulation.id,
      date: new Date('2024-01-01'),
      model: simulation.model,
      progression: 1,
      situation,
      foldedSteps,
      computedResults,
      createdAt: simulation.createdAt,
      updatedAt: expect.any(Date),
      userId: user.id,
      polls: [{ id: poll.id, slug: poll.slug, name: poll.name }],
      groups: [{ id: group.id }],
    })
    expect(await findSimulationComputation(simulation.id)).not.toBeNull()
  })

  it('returns empty groups and polls for a simulation shared with nobody', async () => {
    const { completeSimulation } = setup()
    const user = await verifiedUser()
    const simulation = await startedSimulation(user.id)

    const result = await completeSimulation({
      userSession: authenticated(user),
      simulationId: simulation.id,
      ...payload,
    })

    expect(result).toEqual({
      success: true,
      data: { groups: [], polls: [] },
    })
  })

  it('programs the computation when the model is supported', async () => {
    const { completeSimulation, logger, captureException } = setup()
    const user = await verifiedUser()
    const simulation = await startedSimulation(user.id)

    await completeSimulation({
      userSession: authenticated(user),
      simulationId: simulation.id,
      ...payload,
    })

    expect(await findSimulationComputation(simulation.id)).toEqual({
      simulationId: simulation.id,
      status: 'pending',
      startedAt: null,
      completedAt: null,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    })
    expect(logger.error).not.toHaveBeenCalled()
    expect(captureException).not.toHaveBeenCalled()
  })

  it('reports an unsupported model and completes the simulation without programming a computation', async () => {
    const { completeSimulation, logger, captureException } = setup()
    const user = await verifiedUser()
    const simulation = await simulationFactory
      .withModelRegion('FR')
      .withModelVersion({ publishedTag: '0.0.0' })
      .withProgression(0.2)
      .params({ userId: user.id })
      .create()

    const result = await completeSimulation({
      userSession: authenticated(user),
      simulationId: simulation.id,
      ...payload,
    })

    expect(result).toEqual(expect.objectContaining({ success: true }))
    expect(logger.error).toHaveBeenCalledWith('Unsupported model', {
      model: simulation.model,
    })
    expect(captureException).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'unsupported_model' })
    )
    expect(await findSimulationComputation(simulation.id)).toBeNull()
  })

  it('fails with computation_already_exists and rolls the answers back when a computation is already programmed', async () => {
    const { completeSimulation } = setup()
    const user = await verifiedUser()
    const simulation = await simulationFactory
      .withModelRegion('FR')
      .withProgression(0.2)
      .withPendingComputation()
      .params({ userId: user.id, date: new Date('2024-01-01') })
      .create()

    const result = await completeSimulation({
      userSession: authenticated(user),
      simulationId: simulation.id,
      ...payload,
    })

    expect(result).toEqual({
      success: false,
      error: new ComputationAlreadyExistsError(simulation.id),
    })

    const updated = await findSimulationById({
      id: simulation.id,
      userId: user.id,
    })

    expect(updated).toEqual(
      expect.objectContaining({
        progression: simulation.progression,
        situation: simulation.situation,
        foldedSteps: simulation.foldedSteps,
        computedResults: simulation.computedResults,
      })
    )
  })

  it('fails with simulation_incomplete when the progression is not 1', async () => {
    const { completeSimulation, runInBackground } = setup()
    const user = await verifiedUser()
    const simulation = await startedSimulation(user.id)

    const result = await completeSimulation({
      userSession: authenticated(user),
      simulationId: simulation.id,
      ...payload,
      progression: 0.9,
    })

    expect(result).toEqual({
      success: false,
      error: new SimulationIncompleteError(),
    })
    expect(runInBackground).not.toHaveBeenCalled()

    const updated = await findSimulationById({
      id: simulation.id,
      userId: user.id,
    })
    expect(updated).toEqual(
      expect.objectContaining({ progression: 0.2, situation: {} })
    )
    expect(await findSimulationComputation(simulation.id)).toBeNull()
  })

  it('fails with zero_footprint when the carbon footprint is zero as it is a sign of a bigger issue', async () => {
    const { completeSimulation, runInBackground } = setup()
    const user = await verifiedUser()
    const simulation = await startedSimulation(user.id)

    const result = await completeSimulation({
      userSession: authenticated(user),
      simulationId: simulation.id,
      ...payload,
      computedResults: zeroedComputedResults,
    })

    expect(result).toEqual({
      success: false,
      error: new ZeroFootprintError(),
    })
    expect(runInBackground).not.toHaveBeenCalled()

    const updated = await findSimulationById({
      id: simulation.id,
      userId: user.id,
    })
    expect(updated).toEqual(
      expect.objectContaining({ progression: 0.2, situation: {} })
    )
    expect(await findSimulationComputation(simulation.id)).toBeNull()
  })

  it('fails with simulation_not_found for an unknown simulation', async () => {
    const { completeSimulation } = setup()
    const user = await verifiedUser()

    const result = await completeSimulation({
      userSession: authenticated(user),
      simulationId: '00000000-0000-0000-0000-000000000000',
      ...payload,
    })

    expect(result).toEqual({
      success: false,
      error: new SimulationNotFoundError(),
    })
  })

  it('fails with simulation_not_found for a simulation owned by another user', async () => {
    const { completeSimulation } = setup()
    const [user, other] = await Promise.all([verifiedUser(), verifiedUser()])
    const simulation = await startedSimulation(other.id)

    const result = await completeSimulation({
      userSession: authenticated(user),
      simulationId: simulation.id,
      ...payload,
    })

    expect(result).toEqual({
      success: false,
      error: new SimulationNotFoundError(),
    })

    const updated = await findSimulationById({
      id: simulation.id,
      userId: other.id,
    })
    expect(updated).toEqual(
      expect.objectContaining({ progression: 0.2, situation: {} })
    )
    expect(await findSimulationComputation(simulation.id)).toBeNull()
  })

  it('refuses to complete an already completed simulation', async () => {
    const { completeSimulation, runInBackground } = setup()
    const user = await verifiedUser()
    const simulation = await simulationFactory
      .withModelRegion('FR')
      .completed()
      .params({ userId: user.id })
      .create()

    const result = await completeSimulation({
      userSession: authenticated(user),
      simulationId: simulation.id,
      ...payload,
    })

    expect(result).toEqual({
      success: false,
      error: new SimulationCompletedError(),
    })
    expect(runInBackground).not.toHaveBeenCalled()

    const updated = await findSimulationById({
      id: simulation.id,
      userId: user.id,
    })
    expect(updated).toEqual(expect.objectContaining({ situation: {} }))
    expect(await findSimulationComputation(simulation.id)).toBeNull()
  })

  describe('side effects', () => {
    it('updates the contact with the footprint of the simulation it just completed', async () => {
      const { completeSimulation, addOrUpdateContact, settleBackground } =
        setup()
      const user = await verifiedUser()
      const simulation = await startedSimulation(user.id)

      await completeSimulation({
        userSession: authenticated(user),
        simulationId: simulation.id,
        ...payload,
      })
      await settleBackground()

      expect(addOrUpdateContact).toHaveBeenCalledWith({
        email: user.email,
        attributes: expect.objectContaining({
          [Attributes.USER_ID]: user.id,
          [Attributes.LAST_SIMULATION_DATE]: new Date(
            '2024-01-01'
          ).toISOString(),
          [Attributes.LAST_SIMULATION_BILAN_FOOTPRINT]: '1',
        }),
      })
    })

    it('sends the poll joined email for the poll the user most recently joined', async () => {
      const { completeSimulation, sendEmail, settleBackground } = setup()
      const user = await verifiedUser()
      const simulation = await startedSimulation(user.id)
      await joinPoll(simulation.id)
      const { poll, organisation } = await joinPoll(simulation.id)

      await completeSimulation({
        userSession: authenticated(user),
        simulationId: simulation.id,
        ...payload,
      })
      await settleBackground()

      expect(sendEmail).toHaveBeenCalledTimes(1)
      expect(sendEmail).toHaveBeenCalledWith({
        email: user.email,
        templateId: TemplateIds.fr.ORGANISATION_JOINED,
        params: expect.objectContaining({
          ORGANISATION_NAME: organisation.name,
          DETAILED_VIEW_URL: expect.stringContaining(
            `${origin}/organisations/${organisation.slug}/campagnes/${poll.slug}`
          ),
          SIMULATION_URL: expect.stringContaining(`sid=${simulation.id}`),
        }),
      })
    })

    it('sends the poll joined email in the language of the request', async () => {
      const { completeSimulation, sendEmail, settleBackground } = setup()
      const user = await verifiedUser()
      const simulation = await startedSimulation(user.id)
      await joinPoll(simulation.id)

      await completeSimulation({
        userSession: authenticated(user),
        simulationId: simulation.id,
        ...payload,
        locale: 'en',
      })
      await settleBackground()

      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          templateId: TemplateIds.en.ORGANISATION_JOINED,
        })
      )
    })

    it('sends the group created email when the user is administrator of the group', async () => {
      const { completeSimulation, sendEmail, settleBackground } = setup()
      const user = await verifiedUser()
      const simulation = await startedSimulation(user.id)
      const group = await joinGroup({
        simulationId: simulation.id,
        user,
        administratorId: user.id,
      })

      await completeSimulation({
        userSession: authenticated(user),
        simulationId: simulation.id,
        ...payload,
      })
      await settleBackground()

      expect(sendEmail).toHaveBeenCalledWith({
        email: user.email,
        templateId: TemplateIds.fr.GROUP_CREATED,
        params: expect.objectContaining({
          GROUP_NAME: group.name,
          NAME: user.name,
          GROUP_URL: expect.stringContaining(`groupId=${group.id}`),
          SHARE_URL: expect.stringContaining(`groupId=${group.id}`),
        }),
      })
    })

    it('sends the group joined email when the user is participant of the group', async () => {
      const { completeSimulation, sendEmail, settleBackground } = setup()
      const [user, administrator] = await Promise.all([
        verifiedUser(),
        userFactory.create(),
      ])
      const simulation = await startedSimulation(user.id)
      await joinGroup({
        simulationId: simulation.id,
        user,
        administratorId: administrator.id,
      })

      await completeSimulation({
        userSession: authenticated(user),
        simulationId: simulation.id,
        ...payload,
      })
      await settleBackground()

      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          email: user.email,
          templateId: TemplateIds.fr.GROUP_JOINED,
        })
      )
    })

    it('sends the poll email only when the simulation belongs to both a poll and a group', async () => {
      const { completeSimulation, sendEmail, settleBackground } = setup()
      const user = await verifiedUser()
      const simulation = await startedSimulation(user.id)
      await joinPoll(simulation.id)
      await joinGroup({ simulationId: simulation.id, user })

      await completeSimulation({
        userSession: authenticated(user),
        simulationId: simulation.id,
        ...payload,
      })
      await settleBackground()

      expect(sendEmail).toHaveBeenCalledTimes(1)
      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          templateId: TemplateIds.fr.ORGANISATION_JOINED,
        })
      )
    })

    it('sends the simulation completed email when the simulation is shared with nobody', async () => {
      const { completeSimulation, sendEmail, settleBackground } = setup()
      const user = await verifiedUser()
      const simulation = await startedSimulation(user.id)

      await completeSimulation({
        userSession: authenticated(user),
        simulationId: simulation.id,
        ...payload,
      })
      await settleBackground()

      expect(sendEmail).toHaveBeenCalledTimes(1)
      expect(sendEmail).toHaveBeenCalledWith({
        email: user.email,
        templateId: TemplateIds.fr.SIGN_UP_SIMULATION_COMPLETED,
        params: expect.objectContaining({
          SIMULATION_URL: expect.stringContaining(
            `${origin}/fin?sid=${simulation.id}`
          ),
          DASHBOARD_URL: `${origin}/mon-espace`,
          [Attributes.LAST_SIMULATION_BILAN_FOOTPRINT]: '1',
        }),
      })
    })

    it('sends the simulation completed email in the language of the request', async () => {
      const { completeSimulation, sendEmail, settleBackground } = setup()
      const user = await verifiedUser()
      const simulation = await startedSimulation(user.id)

      await completeSimulation({
        userSession: authenticated(user),
        simulationId: simulation.id,
        ...payload,
        locale: 'en',
      })
      await settleBackground()

      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          templateId: TemplateIds.en.SIGN_UP_SIMULATION_COMPLETED,
        })
      )
    })

    it('does not send emails to an anonymous user and does not try to add the contact', async () => {
      const {
        completeSimulation,
        addOrUpdateContact,
        sendEmail,
        settleBackground,
      } = setup()
      const user = await verifiedUser()
      const simulation = await startedSimulation(user.id)
      await joinPoll(simulation.id)

      const result = await completeSimulation({
        userSession: { id: user.id, isAuth: false },
        simulationId: simulation.id,
        ...payload,
      })
      await settleBackground()

      expect(result).toEqual(expect.objectContaining({ success: true }))
      expect(addOrUpdateContact).not.toHaveBeenCalled()
      expect(sendEmail).not.toHaveBeenCalled()
    })

    it('reports a rejected side effect without failing the completion', async () => {
      const {
        completeSimulation,
        addOrUpdateContact,
        logger,
        captureException,
        settleBackground,
      } = setup()
      const error = new Error('brevo is down')
      addOrUpdateContact.mockRejectedValue(error)
      const user = await verifiedUser()
      const simulation = await startedSimulation(user.id)

      const result = await completeSimulation({
        userSession: authenticated(user),
        simulationId: simulation.id,
        ...payload,
      })
      await settleBackground()

      expect(result).toEqual(expect.objectContaining({ success: true }))
      expect(captureException).toHaveBeenCalledWith(error)
      expect(logger.error).toHaveBeenCalledWith('Failed to run side effect', {
        index: 0,
        error,
      })
    })

    it('reports a failed email without failing the completion', async () => {
      const {
        completeSimulation,
        sendEmail,
        logger,
        captureException,
        settleBackground,
      } = setup()
      const error = new EmailRequestError()
      sendEmail.mockResolvedValue({ success: false, error })
      const user = await verifiedUser()
      const simulation = await startedSimulation(user.id)
      await joinPoll(simulation.id)

      const result = await completeSimulation({
        userSession: authenticated(user),
        simulationId: simulation.id,
        ...payload,
      })
      await settleBackground()

      expect(result).toEqual(expect.objectContaining({ success: true }))
      expect(captureException).toHaveBeenCalledWith(error)
      expect(logger.error).toHaveBeenCalledWith('Failed to run side effect', {
        index: 1,
        error,
      })
    })
  })
})

const origin = 'https://nosgestesclimat.fr'

/**
 * Builds the service with spied dependencies. `runInBackground` keeps the
 * scheduled task so that `settleBackground` can await the side effects the
 * real runtime runs outside of the request lifecycle.
 */
const setup = () => {
  const logger = {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  }
  const captureException = vi.fn()
  const addOrUpdateContact = vi.fn().mockResolvedValue(success())
  const sendEmail = vi.fn().mockResolvedValue(success())
  const backgroundTasks: Promise<void>[] = []
  const runInBackground = vi.fn((task: () => Promise<void>) => {
    backgroundTasks.push(task())
  })

  return {
    logger,
    captureException,
    addOrUpdateContact,
    sendEmail,
    runInBackground,
    completeSimulation: createCompleteSimulation({
      logger,
      captureException,
      addOrUpdateContact,
      sendEmail,
      origin,
      runInBackground,
    }),
    settleBackground: () => Promise.all(backgroundTasks),
  }
}

/**
 * An authenticated session always belongs to a user whose email is verified,
 * and only a verified user exposes an email to the emails sent in background.
 */
const verifiedUser = async () => {
  const user = await userFactory.create()
  const { email } = await verifiedUserFactory.create({
    id: user.id,
    email: user.email!,
  })
  return { ...user, email }
}

const authenticated = (user: { id: string; email: string }): AppUser => ({
  id: user.id,
  email: user.email,
  isAuth: true,
})

const startedSimulation = (userId: string) =>
  simulationFactory
    .withModelRegion('FR')
    .withProgression(0.2)
    .params({ userId, date: new Date('2024-01-01') })
    .create()

const joinPoll = async (simulationId: string) => {
  const organisation = await organisationFactory.create()
  const poll = await pollFactory.withOrganisation(organisation.id).create()
  await prisma.simulationPoll.create({
    data: { pollId: poll.id, simulationId },
  })
  return { poll, organisation }
}

const joinGroup = async ({
  simulationId,
  user,
  administratorId,
}: {
  simulationId: string
  user: { id: string }
  administratorId?: string
}) => {
  const group = await (
    administratorId
      ? groupFactory.withAdministrator(administratorId)
      : groupFactory
  ).create()
  await prisma.groupParticipant.create({
    data: { userId: user.id, simulationId, groupId: group.id },
  })
  return group
}

const computedResults: ComputedResults = {
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

const zeroedComputedResults: ComputedResults = {
  ...computedResults,
  carbone: { ...computedResults.carbone, bilan: 0 },
}

const situation = {
  'transport . voiture . km': 12000,
} as unknown as Record<DottedName, number>
const foldedSteps = ['transport . voiture . km'] as DottedName[]

const payload = {
  situation,
  foldedSteps,
  progression: 1,
  computedResults,
  locale: 'fr',
} satisfies Omit<
  Parameters<ReturnType<typeof createCompleteSimulation>>[0],
  'simulationId' | 'userSession'
>
