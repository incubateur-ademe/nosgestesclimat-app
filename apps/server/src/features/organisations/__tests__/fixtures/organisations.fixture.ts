import type supertest from 'supertest'

import { faker } from '@faker-js/faker'
import { StatusCodes } from 'http-status-codes'
import type { JwtPayload } from 'jsonwebtoken'
import jwt from 'jsonwebtoken'
import {
  brevoRemoveFromList,
  brevoSendEmail,
  brevoUpdateContact,
} from '../../../../adapters/brevo/__tests__/fixtures/server.fixture.js'
import { connectUpdateContact } from '../../../../adapters/connect/__tests__/fixtures/server.fixture.js'
import { prisma } from '../../../../adapters/prisma/client.js'
import { OrganisationType } from '../../../../adapters/prisma/generated.js'
import {
  mswServer,
  resetMswServer,
} from '../../../../core/__tests__/fixtures/server.fixture.js'
import { EventBus } from '../../../../core/event-bus/event-bus.js'
import { COOKIE_NAME } from '../../../authentication/authentication.service.js'
import { getSimulationPayload } from '../../../simulations/__tests__/fixtures/simulations.fixtures.js'
import type { SimulationCreateInputDto } from '../../../simulations/simulations.validator.js'
import type {
  OrganisationCreateDto,
  OrganisationPollCreateDto,
} from '../../organisations.validator.js'

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
  '/organisations/v1/:userId/public-polls/:pollIdOrSlug'

export const CREATE_ORGANISATION_PUBLIC_POLL_SIMULATION_ROUTE =
  '/organisations/v1/:userId/public-polls/:pollIdOrSlug/simulations'

export const FETCH_ORGANISATION_PUBLIC_POLL_SIMULATIONS_ROUTE =
  '/organisations/v1/:userId/public-polls/:pollIdOrSlug/simulations'

type TestAgent = ReturnType<typeof supertest>

const organisationTypes = Object.values(OrganisationType)

export const randomOrganisationType = () =>
  organisationTypes[Math.floor(Math.random() * organisationTypes.length)]

export const createOrganisation = async ({
  agent,
  cookie,
  organisation: { name, type, administrators, numberOfCollaborators } = {},
}: {
  agent: TestAgent
  cookie: string
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
    .set('cookie', cookie)
    .send(payload)
    .expect(StatusCodes.CREATED)

  await EventBus.flush()

  resetMswServer()

  return response.body
}

export const createOrganisationPoll = async ({
  agent,
  cookie,
  organisationId,
  poll: {
    name,
    customAdditionalQuestions,
    defaultAdditionalQuestions,
    expectedNumberOfParticipants,
  } = {},
}: {
  agent: TestAgent
  cookie: string
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
    .set('cookie', cookie)
    .send(payload)
    .expect(StatusCodes.CREATED)

  await EventBus.flush()

  resetMswServer()

  return response.body
}

export const createOrganisationPollSimulation = async ({
  agent,
  userId,
  pollId,
  cookie,
  simulation = {},
}:
  | {
      agent: TestAgent
      userId?: string
      cookie?: undefined
      pollId: string
      simulation?: Partial<SimulationCreateInputDto>
    }
  | {
      agent: TestAgent
      userId?: undefined
      cookie?: string
      pollId: string
      simulation?: Partial<SimulationCreateInputDto>
    }) => {
  let email: string | undefined

  if (cookie) {
    ;({ userId, email } = jwt.decode(
      cookie.split(';').shift()!.replace(`${COOKIE_NAME}=`, '')!
    ) as JwtPayload)
  }

  userId = userId ?? faker.string.uuid()
  const { user } = simulation
  const payload: SimulationCreateInputDto = {
    ...getSimulationPayload(simulation),
    user,
  }

  email = email ?? payload.user?.email

  mswServer.use(
    brevoUpdateContact(),
    brevoRemoveFromList(27, { invalid: true })
  )

  if (email) {
    const existingParticipation = await prisma.simulationPoll.findFirst({
      where: {
        pollId,
        simulation: {
          user: {
            email,
          },
        },
      },
      select: { id: true },
    })

    if (!existingParticipation) {
      mswServer.use(brevoSendEmail())
    }
  }

  const request = agent.post(
    CREATE_ORGANISATION_PUBLIC_POLL_SIMULATION_ROUTE.replace(
      ':userId',
      userId
    ).replace(':pollIdOrSlug', pollId)
  )

  if (cookie) {
    request.set('cookie', cookie)
  }

  const response = await request.send(payload).expect(StatusCodes.CREATED)

  await EventBus.flush()

  resetMswServer()

  return response.body
}

export const downloadOrganisationPollSimulationsResult = async ({
  agent,
  cookie,
  pollId,
  organisationId,
}: {
  agent: TestAgent
  pollId: string
  organisationId: string
  cookie: string
}) => {
  const response = await agent
    .get(
      DOWNLOAD_ORGANISATION_POLL_SIMULATIONS_RESULT_ROUTE.replace(
        ':organisationIdOrSlug',
        organisationId
      ).replace(':pollIdOrSlug', pollId)
    )
    .set('cookie', cookie)
    .expect(StatusCodes.ACCEPTED)

  await EventBus.flush()

  return response.body
}
