import { faker } from '@faker-js/faker'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { BackgroundTaskRunner } from '../../../../lib/background-task-runner.ts'
import { transaction } from '../../../../lib/transaction.ts'
import { prisma } from '../../../../prisma/client.ts'
import { VerificationCodeMode } from '../../../../prisma/generated/client.ts'
import { simulationFactory } from '../../../simulations/factories/simulation.factory.ts'
import { userFactory } from '../../../users/factories/user.factory.ts'
import { InvalidVerificationCodeError } from '../../errors/login.error.ts'
import { verificationCodeFactory } from '../../factories/index.ts'
import { createLogin, verifyCode } from '../login.service.ts'

const logger = {
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
  debug: vi.fn(),
}
const captureException = vi.fn()
const sendWelcomeEmail = vi.fn()
const addOrUpdateContactAfterLogin = vi.fn()

const origin = 'https://nosgestesclimat.test'

// The runner collects the scheduled tasks so the tests can await them: the
// email side effects stay assertable while the service keeps scheduling
// without awaiting.
const createAwaitingBackgroundTaskRunner = () => {
  const tasks: Array<Promise<void>> = []
  const backgroundTaskRunner: BackgroundTaskRunner = (task) => {
    tasks.push(task())
  }

  return {
    backgroundTaskRunner,
    flush: () => Promise.all(tasks.splice(0, tasks.length)),
  }
}

const buildLogin = (backgroundTaskRunner: BackgroundTaskRunner) =>
  createLogin({
    logger,
    captureException,
    sendWelcomeEmail,
    addOrUpdateContactAfterLogin,
    origin,
    backgroundTaskRunner,
  })

describe('verifyCode', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(async () => {
    await prisma.verificationCode.deleteMany()
  })

  it('succeeds for a valid code', async () => {
    const verificationCode = await verificationCodeFactory.create()

    const result = await verifyCode({
      email: verificationCode.email,
      code: verificationCode.code,
    })

    expect(result.success).toBe(true)
    if (!result.success) {
      throw new Error('Expected verifyCode to succeed')
    }
    expect(result.data).toEqual({
      id: verificationCode.id,
      email: verificationCode.email,
      mode: verificationCode.mode,
    })
  })

  it('fails with an InvalidVerificationCodeError when no code was ever requested', async () => {
    const result = await verifyCode({
      email: faker.internet.email().toLocaleLowerCase(),
      code: faker.number.int({ min: 100000, max: 999999 }).toString(),
    })

    expect(result.success).toBe(false)
    if (result.success) {
      throw new Error('Expected verifyCode to fail')
    }
    expect(result.error).toBeInstanceOf(InvalidVerificationCodeError)
  })

  it('fails when the code does not match the one sent', async () => {
    const verificationCode = await verificationCodeFactory.create({
      code: '123456',
    })

    const result = await verifyCode({
      email: verificationCode.email,
      code: '654321',
    })

    expect(result.success).toBe(false)
    if (result.success) {
      throw new Error('Expected verifyCode to fail')
    }
    expect(result.error).toBeInstanceOf(InvalidVerificationCodeError)
  })

  it('fails when the code is expired', async () => {
    const verificationCode = await verificationCodeFactory.create({
      expirationDate: new Date(Date.now() - 1000),
    })

    const result = await verifyCode({
      email: verificationCode.email,
      code: verificationCode.code,
    })

    expect(result.success).toBe(false)
    if (result.success) {
      throw new Error('Expected verifyCode to fail')
    }
    expect(result.error).toBeInstanceOf(InvalidVerificationCodeError)
  })

  it('joins a caller transaction when one is given', async () => {
    const verificationCode = await verificationCodeFactory.create()

    let result: Awaited<ReturnType<typeof verifyCode>> | undefined
    await transaction(async (session) => {
      result = await verifyCode(
        { email: verificationCode.email, code: verificationCode.code },
        { session }
      )
    })

    expect(result?.success).toBe(true)
  })
})

describe('login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(async () => {
    await Promise.all([
      prisma.verificationCode.deleteMany(),
      prisma.simulation.deleteMany(),
    ])
    await Promise.all([
      prisma.verifiedUser.deleteMany(),
      prisma.user.deleteMany(),
    ])
  })

  describe('Given the verification code is invalid', () => {
    it('returns an InvalidVerificationCodeError failure', async () => {
      const { backgroundTaskRunner, flush } =
        createAwaitingBackgroundTaskRunner()

      const result = await buildLogin(backgroundTaskRunner)({
        loginDto: {
          email: faker.internet.email().toLocaleLowerCase(),
          code: faker.number.int({ min: 100000, max: 999999 }).toString(),
        },
        locale: 'fr',
      })
      await flush()

      expect(result.success).toBe(false)
      if (result.success) {
        throw new Error('Expected login to fail')
      }
      expect(result.error).toBeInstanceOf(InvalidVerificationCodeError)
      expect(addOrUpdateContactAfterLogin).not.toHaveBeenCalled()
      expect(sendWelcomeEmail).not.toHaveBeenCalled()
    })
  })

  describe('Given an existing verified account', () => {
    it('signs the user in and keeps the existing account own id', async () => {
      const verifiedUser = await userFactory.verified().create()
      const verificationCode = await verificationCodeFactory.create({
        email: verifiedUser.email,
        mode: VerificationCodeMode.signIn,
      })

      const { backgroundTaskRunner, flush } =
        createAwaitingBackgroundTaskRunner()
      const result = await buildLogin(backgroundTaskRunner)({
        loginDto: {
          email: verifiedUser.email,
          code: verificationCode.code,
        },
        locale: 'fr',
        sessionUserId: faker.string.uuid(),
      })
      await flush()

      expect(result.success).toBe(true)
      if (!result.success) {
        throw new Error('Expected login to succeed')
      }
      expect(result.data.mode).toBe(VerificationCodeMode.signIn)
      expect(result.data.user).toMatchObject({
        id: verifiedUser.id,
        email: verifiedUser.email,
      })
    })

    it('refreshes the Brevo contact without sending a welcome email', async () => {
      const verifiedUser = await userFactory.verified().create()
      const verificationCode = await verificationCodeFactory.create({
        email: verifiedUser.email,
        mode: VerificationCodeMode.signIn,
      })

      const { backgroundTaskRunner, flush } =
        createAwaitingBackgroundTaskRunner()
      const result = await buildLogin(backgroundTaskRunner)({
        loginDto: {
          email: verifiedUser.email,
          code: verificationCode.code,
        },
        locale: 'fr',
      })
      await flush()

      expect(result.success).toBe(true)
      expect(addOrUpdateContactAfterLogin).toHaveBeenCalledWith({
        email: verifiedUser.email,
        userId: verifiedUser.id,
      })
      expect(sendWelcomeEmail).not.toHaveBeenCalled()
    })

    describe('And the user has simulations on their anonymous session', () => {
      it('transfers the anonymous simulations to the verified user', async () => {
        const verifiedUser = await userFactory.verified().create()
        const anonymousUser = await userFactory.create()
        const anonymousSimulation = await simulationFactory
          .params({ userId: anonymousUser.id })
          .create()
        const verificationCode = await verificationCodeFactory.create({
          email: verifiedUser.email,
          mode: VerificationCodeMode.signIn,
        })

        const { backgroundTaskRunner, flush } =
          createAwaitingBackgroundTaskRunner()
        const result = await buildLogin(backgroundTaskRunner)({
          loginDto: {
            email: verifiedUser.email,
            code: verificationCode.code,
          },
          locale: 'fr',
          sessionUserId: anonymousUser.id,
        })
        await flush()

        expect(result.success).toBe(true)

        const simulations = await prisma.simulation.findMany({
          where: { userId: verifiedUser.id },
          select: { id: true, userEmail: true },
        })

        expect(simulations.map(({ id }) => id)).toContain(
          anonymousSimulation.id
        )
        expect(simulations[0].userEmail).toBe(verifiedUser.email)
        expect(
          await prisma.simulation.findMany({
            where: { userId: anonymousUser.id },
          })
        ).toHaveLength(0)
        expect(
          await prisma.user.findUnique({ where: { id: anonymousUser.id } })
        ).toBeNull()
      })

      it('leaves the account untouched when there is no session userId to reconcile from', async () => {
        const verifiedUser = await userFactory.verified().create()
        const anonymousUser = await userFactory.create()
        await simulationFactory.params({ userId: anonymousUser.id }).create()
        const verificationCode = await verificationCodeFactory.create({
          email: verifiedUser.email,
          mode: VerificationCodeMode.signIn,
        })

        const { backgroundTaskRunner, flush } =
          createAwaitingBackgroundTaskRunner()
        const result = await buildLogin(backgroundTaskRunner)({
          loginDto: {
            email: verifiedUser.email,
            code: verificationCode.code,
          },
          locale: 'fr',
        })
        await flush()

        expect(result.success).toBe(true)

        // Without a session userId the reconciliation cannot run: the
        // anonymous session keeps its data.
        expect(
          await prisma.simulation.findMany({
            where: { userId: anonymousUser.id },
          })
        ).toHaveLength(1)
        expect(
          await prisma.user.findUnique({ where: { id: anonymousUser.id } })
        ).not.toBeNull()
      })
    })

    describe('And the session userId already belongs to another verified account', () => {
      it('signs in on the requested account without reconciling the session', async () => {
        const userA = await userFactory.verified().create()
        const userB = await userFactory.verified().create()
        const verificationCode = await verificationCodeFactory.create({
          email: userB.email,
          mode: VerificationCodeMode.signIn,
        })

        const { backgroundTaskRunner, flush } =
          createAwaitingBackgroundTaskRunner()
        const result = await buildLogin(backgroundTaskRunner)({
          loginDto: {
            email: userB.email,
            code: verificationCode.code,
          },
          locale: 'fr',
          sessionUserId: userA.id,
        })
        await flush()

        expect(result.success).toBe(true)
        if (!result.success) {
          throw new Error('Expected login to succeed')
        }
        // The session's userId (userA.id) belongs to account A, so it must
        // not be reconciled into account B: the login answers with the
        // requested account, its own userIdB.
        expect(result.data.user).toMatchObject({
          id: userB.id,
          email: userB.email,
        })
        // Reconciling userA.id into account B would have moved account A's
        // data over and deleted its user row. It must not have run.
        expect(
          await prisma.user.findUnique({ where: { id: userA.id } })
        ).not.toBeNull()
      })
    })
  })

  describe('Given no verified account exists for the email', () => {
    describe('And the session userId is a free anonymous identity', () => {
      it('signs the user up, reusing the session userId as the account id', async () => {
        const anonymousUser = await userFactory.create()
        const anonymousSimulation = await simulationFactory
          .params({ userId: anonymousUser.id })
          .create()
        const verificationCode = await verificationCodeFactory.create({
          mode: VerificationCodeMode.signUp,
        })

        const { backgroundTaskRunner, flush } =
          createAwaitingBackgroundTaskRunner()
        const result = await buildLogin(backgroundTaskRunner)({
          loginDto: {
            email: verificationCode.email,
            code: verificationCode.code,
          },
          locale: 'fr',
          sessionUserId: anonymousUser.id,
        })
        await flush()

        expect(result.success).toBe(true)
        if (!result.success) {
          throw new Error('Expected login to succeed')
        }
        expect(result.data.mode).toBe(VerificationCodeMode.signUp)

        const createdUser = await prisma.verifiedUser.findUnique({
          where: { email: verificationCode.email },
        })

        expect(createdUser).toEqual({
          email: verificationCode.email,
          id: anonymousUser.id,
          name: null,
          optedInForCommunications: false,
          position: null,
          telephone: null,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        })

        // The anonymous user row is updated in place, keeping the user's
        // data attached.
        const simulations = await prisma.simulation.findMany({
          where: { userId: anonymousUser.id },
          select: { id: true },
        })

        expect(simulations).toHaveLength(1)
        expect(simulations[0].id).toBe(anonymousSimulation.id)
      })

      it('invalidates the verification code', async () => {
        const verificationCode = await verificationCodeFactory.create({
          mode: VerificationCodeMode.signUp,
        })

        const { backgroundTaskRunner, flush } =
          createAwaitingBackgroundTaskRunner()
        await buildLogin(backgroundTaskRunner)({
          loginDto: {
            email: verificationCode.email,
            code: verificationCode.code,
          },
          locale: 'fr',
          sessionUserId: faker.string.uuid(),
        })
        await flush()

        const [invalidatedCode] = await prisma.verificationCode.findMany({
          where: { email: verificationCode.email },
        })

        expect(
          Math.floor(
            (Date.now() - invalidatedCode.expirationDate.getTime()) / 1000
          )
        ).toBe(0)
      })

      it('schedules the welcome email and the Brevo contact update', async () => {
        const verificationCode = await verificationCodeFactory.create({
          mode: VerificationCodeMode.signUp,
        })
        const sessionUserId = faker.string.uuid()

        const { backgroundTaskRunner, flush } =
          createAwaitingBackgroundTaskRunner()
        const result = await buildLogin(backgroundTaskRunner)({
          loginDto: {
            email: verificationCode.email,
            code: verificationCode.code,
          },
          locale: 'en',
          sessionUserId,
        })
        await flush()

        expect(result.success).toBe(true)
        expect(sendWelcomeEmail).toHaveBeenCalledWith({
          locale: 'en',
          email: verificationCode.email,
          origin,
        })
        expect(addOrUpdateContactAfterLogin).toHaveBeenCalledWith({
          email: verificationCode.email,
          userId: sessionUserId,
        })
      })

      it('merges the legacy anonymous users sharing the email into the fresh account', async () => {
        const email = faker.internet.email().toLocaleLowerCase()
        // Legacy anonymous user: unverified, but with an email set.
        const legacyUser = await prisma.user.create({
          data: {
            id: faker.string.uuid(),
            email,
            name: faker.person.fullName(),
          },
          select: { id: true },
        })
        const legacySimulation = await simulationFactory
          .params({ userId: legacyUser.id })
          .create()
        const verificationCode = await verificationCodeFactory.create({
          email,
          mode: VerificationCodeMode.signUp,
        })
        const sessionUserId = faker.string.uuid()

        const { backgroundTaskRunner, flush } =
          createAwaitingBackgroundTaskRunner()
        const result = await buildLogin(backgroundTaskRunner)({
          loginDto: {
            email: verificationCode.email,
            code: verificationCode.code,
          },
          locale: 'fr',
          sessionUserId,
        })
        await flush()

        expect(result.success).toBe(true)

        const simulations = await prisma.simulation.findMany({
          where: { userId: sessionUserId },
          select: { id: true },
        })

        expect(simulations.map(({ id }) => id)).toContain(legacySimulation.id)
        expect(
          await prisma.user.findUnique({ where: { id: legacyUser.id } })
        ).toBeNull()
      })
    })

    describe('And the session userId already belongs to another verified account', () => {
      it('signs the user up with a fresh userId instead of reusing the taken one', async () => {
        const userA = await userFactory.verified().create()
        const verificationCode = await verificationCodeFactory.create({
          mode: VerificationCodeMode.signUp,
        })

        const { backgroundTaskRunner, flush } =
          createAwaitingBackgroundTaskRunner()
        const result = await buildLogin(backgroundTaskRunner)({
          loginDto: {
            email: verificationCode.email,
            code: verificationCode.code,
          },
          locale: 'fr',
          sessionUserId: userA.id,
        })
        await flush()

        expect(result.success).toBe(true)
        if (!result.success) {
          throw new Error('Expected login to succeed')
        }

        // The invariant holds: the new account must not share userA.id with
        // account A.
        expect(result.data.user.id).not.toBe(userA.id)

        const createdUser = await prisma.verifiedUser.findUnique({
          where: { email: verificationCode.email },
        })

        expect(createdUser?.id).toBe(result.data.user.id)
      })
    })
  })

  describe('Given the email side effects fail', () => {
    it('still succeeds and captures the errors', async () => {
      const verificationCode = await verificationCodeFactory.create({
        mode: VerificationCodeMode.signUp,
      })

      sendWelcomeEmail.mockRejectedValueOnce(new Error('Brevo unavailable'))
      addOrUpdateContactAfterLogin.mockRejectedValueOnce(
        new Error('Brevo unavailable')
      )

      const { backgroundTaskRunner, flush } =
        createAwaitingBackgroundTaskRunner()
      const result = await buildLogin(backgroundTaskRunner)({
        loginDto: {
          email: verificationCode.email,
          code: verificationCode.code,
        },
        locale: 'fr',
        sessionUserId: faker.string.uuid(),
      })
      await flush()

      expect(result.success).toBe(true)

      const createdUser = await prisma.verifiedUser.findUnique({
        where: { email: verificationCode.email },
      })
      expect(createdUser).not.toBeNull()

      expect(captureException).toHaveBeenCalledTimes(2)
      expect(logger.error).toHaveBeenCalledWith(
        'Failed to run side effect',
        expect.objectContaining({ error: expect.any(Error) })
      )
    })
  })
})
