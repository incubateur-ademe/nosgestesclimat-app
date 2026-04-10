import { faker } from '@faker-js/faker'
import { StatusCodes } from 'http-status-codes'
import supertest from 'supertest'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'
import {
  brevoSendEmail,
  brevoUpdateContact,
} from '../../../adapters/brevo/__tests__/fixtures/server.fixture.js'
import { prisma } from '../../../adapters/prisma/client.js'
import { VerificationCodeMode } from '../../../adapters/prisma/generated.js'
import app from '../../../app.js'
import { mswServer } from '../../../core/__tests__/fixtures/server.fixture.js'
import { EventBus } from '../../../core/event-bus/event-bus.js'
import {
  createGroup,
  FETCH_USER_GROUP_ROUTE,
  joinGroup,
} from '../../groups/__tests__/fixtures/groups.fixture.js'
import {
  createSimulation,
  FETCH_USER_SIMULATIONS_ROUTE,
} from '../../simulations/__tests__/fixtures/simulations.fixtures.js'
import { LOGIN_ROUTE } from './fixtures/login.fixture.js'
import { createVerificationCode } from './fixtures/verification-codes.fixture.js'

describe('Given a NGC user with a previous anonymous session', () => {
  const agent = supertest(app)

  afterEach(async () => {
    await Promise.all([
      prisma.verificationCode.deleteMany(),
      prisma.groupParticipant.deleteMany(),
      prisma.groupAdministrator.deleteMany(),
      prisma.simulation.deleteMany(),
    ])
    await Promise.all([
      prisma.verifiedUser.deleteMany(),
      prisma.group.deleteMany(),
      prisma.user.deleteMany(),
    ])
  })

  describe('When the user has simulations on their anonymous session and signs up', () => {
    let email: string
    let anonUserId: string
    let simulation: Awaited<ReturnType<typeof createSimulation>>

    beforeEach(async () => {
      email = faker.internet.email().toLocaleLowerCase()
      anonUserId = faker.string.uuid()

      simulation = await createSimulation({
        agent,
        userId: anonUserId,
        simulation: { user: { email } },
      })

      const verificationCode = await createVerificationCode({
        agent,
        verificationCode: { email },
        mode: VerificationCodeMode.signUp,
      })

      mswServer.use(brevoUpdateContact(), brevoSendEmail())

      await agent
        .post(LOGIN_ROUTE)
        .send({
          userId: anonUserId,
          email: verificationCode.email,
          code: verificationCode.code,
        })
        .expect(StatusCodes.OK)

      await EventBus.flush()
    })

    test('Then the simulation remains accessible under the same userId', async () => {
      const response = await agent
        .get(FETCH_USER_SIMULATIONS_ROUTE.replace(':userId', anonUserId))
        .expect(StatusCodes.OK)

      expect(response.body).toHaveLength(1)
      expect(response.body[0].id).toBe(simulation.id)
    })
  })

  describe('When the user has simulations on their anonymous session and signs in', () => {
    let email: string
    let verifiedUserId: string
    let anonUserId: string
    let anonSimulation: Awaited<ReturnType<typeof createSimulation>>

    beforeEach(async () => {
      email = faker.internet.email().toLocaleLowerCase()
      verifiedUserId = faker.string.uuid()
      anonUserId = faker.string.uuid()

      // First: sign up to create the verified account
      const signUpCode = await createVerificationCode({
        agent,
        verificationCode: { email },
        mode: VerificationCodeMode.signUp,
      })

      mswServer.use(brevoUpdateContact(), brevoSendEmail())

      await agent
        .post(LOGIN_ROUTE)
        .send({
          userId: verifiedUserId,
          email: signUpCode.email,
          code: signUpCode.code,
        })
        .expect(StatusCodes.OK)

      await EventBus.flush()

      // Then: create a simulation on a fresh anonymous session
      anonSimulation = await createSimulation({
        agent,
        userId: anonUserId,
        simulation: { user: { email } },
      })
    })

    describe('And the user signs in from the anonymous session', () => {
      beforeEach(async () => {
        const signInCode = await createVerificationCode({
          agent,
          verificationCode: { email },
          mode: VerificationCodeMode.signIn,
        })

        mswServer.use(brevoUpdateContact())

        await agent
          .post(LOGIN_ROUTE)
          .send({
            userId: anonUserId,
            email: signInCode.email,
            code: signInCode.code,
          })
          .expect(StatusCodes.OK)

        await EventBus.flush()
      })

      test('Then the anonymous simulation is transferred to the verified user', async () => {
        const response = await agent
          .get(FETCH_USER_SIMULATIONS_ROUTE.replace(':userId', verifiedUserId))
          .expect(StatusCodes.OK)

        const simulationIds = response.body.map((s: { id: string }) => s.id)
        expect(simulationIds).toContain(anonSimulation.id)
      })

      test('Then the anonymous session no longer holds any simulations', async () => {
        const response = await agent
          .get(FETCH_USER_SIMULATIONS_ROUTE.replace(':userId', anonUserId))
          .expect(StatusCodes.OK)

        expect(response.body).toHaveLength(0)
      })
    })

    describe('When the anonymous user is a participant in a group', () => {
      let email: string
      let verifiedUserId: string
      let anonUserId: string
      let anonSimulation: Awaited<ReturnType<typeof createSimulation>>
      let groupId: string

      beforeEach(async () => {
        email = faker.internet.email().toLocaleLowerCase()
        verifiedUserId = faker.string.uuid()
        anonUserId = faker.string.uuid()

        // Sign up to create verified account
        const signUpCode = await createVerificationCode({
          agent,
          verificationCode: { email },
          mode: VerificationCodeMode.signUp,
        })

        mswServer.use(brevoUpdateContact(), brevoSendEmail())

        await agent
          .post(LOGIN_ROUTE)
          .send({
            userId: verifiedUserId,
            email: signUpCode.email,
            code: signUpCode.code,
          })
          .expect(StatusCodes.OK)

        await EventBus.flush()

        // Create a group and have the anonymous user join it
        const group = await createGroup({ agent })
        groupId = group.id

        await joinGroup({
          agent,
          groupId,
          participant: { userId: anonUserId },
        })

        // Create a simulation on the anonymous session
        anonSimulation = await createSimulation({
          agent,
          userId: anonUserId,
          simulation: { user: { email } },
        })
      })

      describe('And the user signs in from the anonymous session', () => {
        beforeEach(async () => {
          const signInCode = await createVerificationCode({
            agent,
            verificationCode: { email },
            mode: VerificationCodeMode.signIn,
          })

          mswServer.use(brevoUpdateContact())

          await agent
            .post(LOGIN_ROUTE)
            .send({
              userId: anonUserId,
              email: signInCode.email,
              code: signInCode.code,
            })
            .expect(StatusCodes.OK)

          await EventBus.flush()
        })

        test('Then the anonymous simulation is transferred to the verified user', async () => {
          const response = await agent
            .get(
              FETCH_USER_SIMULATIONS_ROUTE.replace(':userId', verifiedUserId)
            )
            .expect(StatusCodes.OK)

          const simulationIds = response.body.map((s: { id: string }) => s.id)
          expect(simulationIds).toContain(anonSimulation.id)
        })

        test('Then the group participation is migrated to the verified user', async () => {
          const response = await agent
            .get(
              FETCH_USER_GROUP_ROUTE.replace(':userId', verifiedUserId).replace(
                ':groupId',
                groupId
              )
            )
            .expect(StatusCodes.OK)

          expect(response.body.id).toBe(groupId)
        })
      })
    })
  })
})
