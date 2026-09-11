import type supertest from 'supertest'

import { faker } from '@faker-js/faker'
import { prisma } from '@nosgestesclimat/core/prisma/client'
import { StatusCodes } from 'http-status-codes'
import * as v from 'valibot'
import {
  brevoRemoveFromList,
  brevoSendEmail,
  brevoUpdateContact,
} from '../../../../adapters/brevo/__tests__/fixtures/server.fixture.ts'
import { connectUpdateContact } from '../../../../adapters/connect/__tests__/fixtures/server.fixture.ts'
import { OrganisationType } from '../../../../adapters/prisma/generated.ts'
import { authHeaders } from '../../../../core/__tests__/fixtures/authentication.fixture.ts'
import {
  mswServer,
  resetMswServer,
} from '../../../../core/__tests__/fixtures/server.fixture.ts'
import { EventBus } from '../../../../core/event-bus/event-bus.ts'
import { getSimulationPayload } from '../../../simulations/__tests__/fixtures/simulations.fixtures.ts'
import {
  SimulationParticipantCreateDto,
  type SimulationParticipantCreateInputDto,
} from '../../../simulations/simulations.validator.ts'
import type {
  OrganisationCreateDto,
  OrganisationPollCreateDto,
} from '../../organisations.validator.ts'

export const CREATE_ORGANISATION_ROUTE = '/organisations/v1'

export const UPDATE_ORGANISATION_ROUTE =
  '/organisations/v1/:organisationIdOrSlug'

export const FETCH_ORGANISATIONS_ROUTE = '/organisations/v1'

export const FETCH_ORGANISATION_ROUTE =
  '/organisations/v1/:organisationIdOrSlug'

export const CREATE_ORGANISATION_POLL_ROUTE =
  '/organisations/v1/:organisationIdOrSlug/polls'

export const UPDATE_ORGANISATION_POLL_ROUTE =
  '/organisations/v1/:organisationIdOrSlug/polls/:pollIdOrSlug'

export const DELETE_ORGANISATION_POLL_ROUTE =
  '/organisations/v1/:organisationIdOrSlug/polls/:pollIdOrSlug'

export const FETCH_ORGANISATION_POLLS_ROUTE =
  '/organisations/v1/:organisationIdOrSlug/polls'

export const FETCH_ORGANISATION_POLL_ROUTE =
  '/organisations/v1/:organisationIdOrSlug/polls/:pollIdOrSlug'

export const DOWNLOAD_ORGANISATION_POLL_SIMULATIONS_RESULT_ROUTE =
  '/organisations/v1/:organisationIdOrSlug/polls/:pollIdOrSlug/simulations/download'

export const FETCH_ORGANISATION_PUBLIC_POLL_ROUTE =
  '/organisations/v1/public-polls/:pollIdOrSlug'

type TestAgent = ReturnType<typeof supertest>

const organisationTypes = Object.values(OrganisationType)

export const randomOrganisationType = () =>
  organisationTypes[Math.floor(Math.random() * organisationTypes.length)]

export const createOrganisation = async ({
  agent,
  userId = faker.string.uuid(),
  email = faker.internet.email(),
  organisation: { name, type, administrators, numberOfCollaborators } = {},
}: {
  agent: TestAgent
  userId?: string
  email?: string
  organisation?: Partial<OrganisationCreateDto>
}) => {
  const payload: OrganisationCreateDto = {
    name: name || faker.company.name(),
    type: type || randomOrganisationType(),
    administrators,
    numberOfCollaborators,
  }

  mswServer.use(brevoSendEmail(), brevoUpdateContact(), connectUpdateContact())

  const [administrator] = administrators || []

  if (!administrator?.optedInForCommunications) {
    mswServer.use(brevoRemoveFromList(27, { invalid: true }))
  }

  const response = await agent
    .post(CREATE_ORGANISATION_ROUTE)
    .set(authHeaders({ userId, email }))
    .send(payload)
    .expect(StatusCodes.CREATED)

  await EventBus.flush()

  resetMswServer()

  return response.body
}

export const createOrganisationPoll = async ({
  agent,
  userId,
  email,
  organisationId,
  poll: {
    name,
    customAdditionalQuestions,
    defaultAdditionalQuestions,
    expectedNumberOfParticipants,
  } = {},
}: {
  agent: TestAgent
  userId: string
  email: string
  organisationId: string
  poll?: Partial<OrganisationPollCreateDto>
}) => {
  const payload: OrganisationPollCreateDto = {
    name: name || faker.company.buzzNoun(),
    mode: 'standard',
    customAdditionalQuestions,
    defaultAdditionalQuestions,
    expectedNumberOfParticipants,
  }

  mswServer.use(brevoSendEmail(), brevoUpdateContact())

  const {
    administrators: [administrator],
  } = await prisma.organisation.findUniqueOrThrow({
    where: {
      id: organisationId,
    },
    select: {
      administrators: {
        select: {
          user: {
            select: {
              optedInForCommunications: true,
            },
          },
        },
      },
    },
  })

  if (!administrator.user.optedInForCommunications) {
    mswServer.use(brevoRemoveFromList(27, { invalid: true }))
  }

  const response = await agent
    .post(
      CREATE_ORGANISATION_POLL_ROUTE.replace(
        ':organisationIdOrSlug',
        organisationId
      )
    )
    .set(authHeaders({ userId, email }))
    .send(payload)
    .expect(StatusCodes.CREATED)

  await EventBus.flush()

  resetMswServer()

  return response.body
}

/**
 * Seeds a poll participation in database: joining a poll no longer goes
 * through this API (see core `participate-to-poll` service).
 */
export const createOrganisationPollSimulation = async ({
  userId = faker.string.uuid(),
  pollId,
  simulation = {},
}: {
  userId?: string
  pollId: string
  simulation?: Partial<
    Omit<SimulationParticipantCreateInputDto, 'additionalQuestionsAnswers'>
  >
}) => {
  const {
    id,
    date,
    model,
    situation,
    foldedSteps,
    progression,
    computedResults,
  } = v.parse(SimulationParticipantCreateDto, getSimulationPayload(simulation))

  await prisma.user.upsert({
    where: { id: userId },
    create: { id: userId },
    update: {},
  })

  await prisma.simulation.create({
    data: {
      id,
      date,
      model,
      situation,
      foldedSteps,
      progression,
      computedResults,
      userId,
      polls: { create: { pollId } },
    },
  })

  return { id, progression, computedResults, user: { id: userId } }
}

export const downloadOrganisationPollSimulationsResult = async ({
  agent,
  userId,
  email,
  pollId,
  organisationId,
}: {
  agent: TestAgent
  userId: string
  email: string
  pollId: string
  organisationId: string
}) => {
  const response = await agent
    .get(
      DOWNLOAD_ORGANISATION_POLL_SIMULATIONS_RESULT_ROUTE.replace(
        ':organisationIdOrSlug',
        organisationId
      ).replace(':pollIdOrSlug', pollId)
    )
    .set(authHeaders({ userId, email }))
    .expect(StatusCodes.ACCEPTED)

  await EventBus.flush()

  return response.body
}
