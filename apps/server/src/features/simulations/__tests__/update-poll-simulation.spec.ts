import { faker } from '@faker-js/faker'
import { StatusCodes } from 'http-status-codes'
import supertest from 'supertest'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'
import {
  brevoRemoveFromList,
  brevoUpdateContact,
} from '../../../adapters/brevo/__tests__/fixtures/server.fixture.js'
import { prisma } from '../../../adapters/prisma/client.js'
import app from '../../../app.js'
import {
  mswServer,
  resetMswServer,
} from '../../../core/__tests__/fixtures/server.fixture.js'
import { EventBus } from '../../../core/event-bus/event-bus.js'
import { login } from '../../authentication/__tests__/fixtures/login.fixture.js'
import {
  CREATE_ORGANISATION_PUBLIC_POLL_SIMULATION_ROUTE,
  createOrganisation,
  createOrganisationPoll,
  createOrganisationPollSimulation,
} from '../../organisations/__tests__/fixtures/organisations.fixture.js'
import type { SimulationCreateInputDto } from '../simulations.validator.js'
import { getRandomTestCase } from './fixtures/simulations.fixtures.js'

describe('Given a completed poll simulation (progression = 1)', () => {
  const agent = supertest(app)
  const url = CREATE_ORGANISATION_PUBLIC_POLL_SIMULATION_ROUTE
  const { computedResults, situation, extendedSituation } = getRandomTestCase()

  let userId: string
  let simulationId: string
  let pollId: string

  afterEach(async () => {
    await EventBus.flush()
    await Promise.all([
      prisma.organisationAdministrator.deleteMany(),
      prisma.simulationPoll.deleteMany(),
    ])
    await Promise.all([
      prisma.organisation.deleteMany(),
      prisma.user.deleteMany(),
      prisma.verifiedUser.deleteMany(),
      prisma.verificationCode.deleteMany(),
    ])
  })

  beforeEach(async () => {
    const { cookie } = await login({ agent })
    const organisation = await createOrganisation({ agent, cookie })
    const poll = await createOrganisationPoll({
      agent,
      cookie,
      organisationId: organisation.id,
    })
    pollId = poll.id
    userId = faker.string.uuid()
    simulationId = faker.string.uuid()

    await createOrganisationPollSimulation({
      agent,
      userId,
      pollId,
      simulation: {
        id: simulationId,
        situation,
        progression: 1,
        computedResults,
        extendedSituation,
      },
    })
  })

  describe('When updating it with a different progression', () => {
    test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
      const payload: SimulationCreateInputDto = {
        id: simulationId,
        situation,
        progression: 0.5,
        computedResults,
        extendedSituation,
      }

      const response = await agent
        .post(url.replace(':userId', userId).replace(':pollIdOrSlug', pollId))
        .send(payload)
        .expect(StatusCodes.BAD_REQUEST)

      expect(response.text).toContain('immutable')
    })
  })

  describe('When updating it with the same progression', () => {
    test(`Then it returns a ${StatusCodes.CREATED} response`, async () => {
      const payload: SimulationCreateInputDto = {
        id: simulationId,
        situation,
        progression: 1,
        computedResults,
        extendedSituation,
      }

      mswServer.use(
        brevoUpdateContact(),
        brevoRemoveFromList(27, { invalid: true })
      )

      await agent
        .post(url.replace(':userId', userId).replace(':pollIdOrSlug', pollId))
        .send(payload)
        .expect(StatusCodes.CREATED)

      await EventBus.flush()

      resetMswServer()
    })
  })
})
