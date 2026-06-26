import type supertest from 'supertest'

import { faker } from '@faker-js/faker'
import { prisma } from '@nosgestesclimat/core/prisma/client'
import { StatusCodes } from 'http-status-codes'
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
import type { SimulationCreateInputDto } from '../../../simulations/simulations.validator.ts'
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

export const CREATE_ORGANISATION_PUBLIC_POLL_SIMULATION_ROUTE =
  '/organisations/v1/public-polls/:pollIdOrSlug/simulations'

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

export const createOrganisationPollSimulation = async ({
  agent,
  userId = faker.string.uuid(),
  email,
  pollId,
  simulation = {},
}: {
  agent: TestAgent
  userId?: string
  email?: string
  pollId: string
  simulation?: Partial<SimulationCreateInputDto>
}) => {
  const { user } = simulation
  const payload: SimulationCreateInputDto = {
    ...getSimulationPayload(simulation),
    user,
  }

  const contactEmail = email ?? payload.user?.email

  mswServer.use(
    brevoUpdateContact(),
    brevoRemoveFromList(27, { invalid: true })
  )

  if (contactEmail) {
    const existingParticipation = await prisma.simulationPoll.findFirst({
      where: {
        pollId,
        simulation: {
          user: {
            email: contactEmail,
          },
        },
      },
      select: { id: true },
    })

    if (!existingParticipation) {
      mswServer.use(brevoSendEmail())
    }
  }

  const response = await agent
    .post(
      CREATE_ORGANISATION_PUBLIC_POLL_SIMULATION_ROUTE.replace(
        ':pollIdOrSlug',
        pollId
      )
    )
    .set(authHeaders({ userId, email }))
    .send(payload)
    .expect(StatusCodes.CREATED)

  await EventBus.flush()

  resetMswServer()

  return response.body
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
