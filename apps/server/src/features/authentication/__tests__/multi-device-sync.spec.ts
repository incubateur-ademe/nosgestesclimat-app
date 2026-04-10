import { faker } from '@faker-js/faker'
import { StatusCodes } from 'http-status-codes'
import supertest from 'supertest'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'
import { VerificationCodeMode } from '../../../adapters/prisma/generated.js'
import {
  brevoSendEmail,
  brevoUpdateContact,
} from '../../../adapters/brevo/__tests__/fixtures/server.fixture.js'
import { prisma } from '../../../adapters/prisma/client.js'
import app from '../../../app.js'
import { mswServer } from '../../../core/__tests__/fixtures/server.fixture.js'
import { EventBus } from '../../../core/event-bus/event-bus.js'
import {
  createSimulation,
  FETCH_USER_SIMULATIONS_ROUTE,
} from '../../simulations/__tests__/fixtures/simulations.fixtures.js'
import { LOGIN_ROUTE } from './fixtures/login.fixture.js'
import { createVerificationCode } from './fixtures/verification-codes.fixture.js'

describe('Given a NGC user', () => {
  const agent = supertest(app)

  afterEach(async () => {
    await Promise.all([
      prisma.verificationCode.deleteMany(),
      prisma.verifiedUser.deleteMany(),
      prisma.user.deleteMany(),
      prisma.simulation.deleteMany(),
    ])
  })

  describe('When creating simulations on multiple devices with unverified email', () => {
    let email: string
    let device1UserId: string
    let device2UserId: string
    let simulation1: Awaited<ReturnType<typeof createSimulation>>
    let simulation2: Awaited<ReturnType<typeof createSimulation>>

    beforeEach(async () => {
      email = faker.internet.email().toLocaleLowerCase()
      device1UserId = faker.string.uuid()
      device2UserId = faker.string.uuid()

      // Create simulation on device 1
      simulation1 = await createSimulation({
        agent,
        userId: device1UserId,
        simulation: { user: { email } },
      })

      // Create simulation on device 2
      simulation2 = await createSimulation({
        agent,
        userId: device2UserId,
        simulation: { user: { email } },
      })
    })

    test('Then it keeps simulations separate without syncing', async () => {
      // Fetch simulations for device 1
      const response1 = await agent
        .get(FETCH_USER_SIMULATIONS_ROUTE.replace(':userId', device1UserId))
        .expect(StatusCodes.OK)

      expect(response1.body).toHaveLength(1)
      expect(response1.body[0].id).toBe(simulation1.id)

      // Fetch simulations for device 2
      const response2 = await agent
        .get(FETCH_USER_SIMULATIONS_ROUTE.replace(':userId', device2UserId))
        .expect(StatusCodes.OK)

      expect(response2.body).toHaveLength(1)
      expect(response2.body[0].id).toBe(simulation2.id)
    })

    describe('And verifying email on device 1', () => {
      beforeEach(async () => {
        const verificationCode = await createVerificationCode({
          agent,
          verificationCode: { email },
          mode: VerificationCodeMode.signUp,
        })

        mswServer.use(brevoUpdateContact(), brevoSendEmail())

        await agent
          .post(LOGIN_ROUTE)
          .send({
            userId: device1UserId,
            email: verificationCode.email,
            code: verificationCode.code,
          })
          .expect(StatusCodes.OK)

        await EventBus.flush()
      })

      test('Then it syncs both simulations to device 1 userId', async () => {
        // Fetch simulations for device 1 (without auth) - should have both
        const response = await agent
          .get(FETCH_USER_SIMULATIONS_ROUTE.replace(':userId', device1UserId))
          .expect(StatusCodes.OK)

        expect(response.body).toHaveLength(2)

        const simulationIds = response.body.map((s: { id: string }) => s.id)
        expect(simulationIds).toContain(simulation1.id)
        expect(simulationIds).toContain(simulation2.id)

        // Device 2 should have no simulations anymore (transferred)
        const response2 = await agent
          .get(FETCH_USER_SIMULATIONS_ROUTE.replace(':userId', device2UserId))
          .expect(StatusCodes.OK)

        expect(response2.body).toHaveLength(0)
      })

      describe('And logging in again from device 2', () => {
        beforeEach(async () => {
          const verificationCode = await createVerificationCode({
            agent,
            verificationCode: { email },
            mode: VerificationCodeMode.signIn,
          })

          mswServer.use(brevoUpdateContact())

          await agent
            .post(LOGIN_ROUTE)
            .send({
              userId: device2UserId,
              email: verificationCode.email,
              code: verificationCode.code,
            })
            .expect(StatusCodes.OK)

          await EventBus.flush()
        })

        test('Then it does not create another account and does not sync again', async () => {
          // Device 1 should still have both simulations
          const response = await agent
            .get(FETCH_USER_SIMULATIONS_ROUTE.replace(':userId', device1UserId))
            .expect(StatusCodes.OK)

          expect(response.body).toHaveLength(2)

          // Device 2 should still have no simulations
          const response2 = await agent
            .get(FETCH_USER_SIMULATIONS_ROUTE.replace(':userId', device2UserId))
            .expect(StatusCodes.OK)

          expect(response2.body).toHaveLength(0)
        })
      })
    })

    describe('And verifying email on device 2 first', () => {
      beforeEach(async () => {
        const verificationCode = await createVerificationCode({
          agent,
          verificationCode: { email },
          mode: VerificationCodeMode.signUp,
        })

        mswServer.use(brevoUpdateContact(), brevoSendEmail())

        await agent
          .post(LOGIN_ROUTE)
          .send({
            userId: device2UserId,
            email: verificationCode.email,
            code: verificationCode.code,
          })
          .expect(StatusCodes.OK)

        await EventBus.flush()
      })

      test('Then it syncs both simulations to device 2 userId', async () => {
        // Fetch simulations for device 2 - should now have both
        const response = await agent
          .get(FETCH_USER_SIMULATIONS_ROUTE.replace(':userId', device2UserId))
          .expect(StatusCodes.OK)

        expect(response.body).toHaveLength(2)

        const simulationIds = response.body.map((s: { id: string }) => s.id)
        expect(simulationIds).toContain(simulation1.id)
        expect(simulationIds).toContain(simulation2.id)

        // Device 1 should have no simulations anymore (transferred)
        const response1 = await agent
          .get(FETCH_USER_SIMULATIONS_ROUTE.replace(':userId', device1UserId))
          .expect(StatusCodes.OK)

        expect(response1.body).toHaveLength(0)
      })
    })
  })

  describe('When creating simulations on same device with different emails', () => {
    let email1: string
    let email2: string
    let userId: string
    let simulation1: Awaited<ReturnType<typeof createSimulation>>
    let simulation2: Awaited<ReturnType<typeof createSimulation>>

    beforeEach(async () => {
      email1 = faker.internet.email().toLocaleLowerCase()
      email2 = faker.internet.email().toLocaleLowerCase()
      userId = faker.string.uuid()

      // Create first simulation with email1
      simulation1 = await createSimulation({
        agent,
        userId,
        simulation: { user: { email: email1 } },
      })

      // Create second simulation with email2
      simulation2 = await createSimulation({
        agent,
        userId,
        simulation: { user: { email: email2 } },
      })
    })

    test('Then it creates both simulations with same userId', async () => {
      const response = await agent
        .get(FETCH_USER_SIMULATIONS_ROUTE.replace(':userId', userId))
        .expect(StatusCodes.OK)

      expect(response.body).toHaveLength(2)

      const simulationIds = response.body.map((s: { id: string }) => s.id)
      expect(simulationIds).toContain(simulation1.id)
      expect(simulationIds).toContain(simulation2.id)
    })

    describe('And verifying first email', () => {
      beforeEach(async () => {
        const verificationCode = await createVerificationCode({
          agent,
          verificationCode: { email: email1 },
          mode: VerificationCodeMode.signUp,
        })

        mswServer.use(brevoUpdateContact(), brevoSendEmail())

        await agent
          .post(LOGIN_ROUTE)
          .send({
            userId,
            email: verificationCode.email,
            code: verificationCode.code,
          })
          .expect(StatusCodes.OK)

        await EventBus.flush()
      })

      test('Then it keeps both simulations under the same userId', async () => {
        // Both simulations should still be accessible by userId
        const response = await agent
          .get(FETCH_USER_SIMULATIONS_ROUTE.replace(':userId', userId))
          .expect(StatusCodes.OK)

        expect(response.body).toHaveLength(2)

        const simulationIds = response.body.map((s: { id: string }) => s.id)
        expect(simulationIds).toContain(simulation1.id)
        expect(simulationIds).toContain(simulation2.id)
      })
    })
  })
})
