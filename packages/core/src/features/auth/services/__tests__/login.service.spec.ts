import { faker } from '@faker-js/faker'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { BackgroundTaskRunner } from '../../../../lib/background-task-runner.ts'
import { failure, success } from '../../../../lib/result.ts'
import { prisma } from '../../../../prisma/client.ts'
import { VerificationCodeUsage } from '../../../../prisma/generated/client.ts'
import { emptyDatabase } from '../../../../test-utils/empty-database.ts'
import { EmailRequestError } from '../../../emails/errors.ts'
import { simulationFactory } from '../../../simulations/factories/simulation.factory.ts'
import { userFactory } from '../../../users/factories/user.factory.ts'
import {
  findUserById,
  findVerifiedUserByEmail,
} from '../../../users/repositories/users.repository.ts'
import { reconcileSimulationsAfterLogin } from '../../../users/services/reconcile-simulations-after-login.service.ts'
import { syncUserData } from '../../../users/services/sync-user-data.service.ts'
import { InvalidVerificationCodeError } from '../../errors/login.error.ts'
import { verificationCodeFactory } from '../../factories/verification-code.factory.ts'
import { findVerificationCode } from '../../repositories/verification-codes.repository.ts'
import { createLogin } from '../login.service.ts'

// Both reconciliation helpers are spied on but keep their real
// implementations: their database effects stay covered while the tests
// assert the login service only reaches for them when it should.
vi.mock(
  '../../../users/services/sync-user-data.service.ts',
  async (importOriginal) => {
    const actual = await importOriginal<{
      syncUserData: typeof syncUserData
    }>()
    return { ...actual, syncUserData: vi.fn(actual.syncUserData) }
  }
)

vi.mock(
  '../../../users/services/reconcile-simulations-after-login.service.ts',
  async (importOriginal) => {
    const actual = await importOriginal<{
      reconcileSimulationsAfterLogin: typeof reconcileSimulationsAfterLogin
    }>()
    return {
      ...actual,
      reconcileSimulationsAfterLogin: vi.fn(
        actual.reconcileSimulationsAfterLogin
      ),
    }
  }
)

const logger = {
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
  debug: vi.fn(),
}
const captureException = vi.fn()
const sendEmail = vi.fn().mockResolvedValue(success())
const addOrUpdateContact = vi.fn().mockResolvedValue(success())

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
    sendEmail,
    addOrUpdateContact,
    origin,
    backgroundTaskRunner,
  })

describe('login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(async () => {
    await emptyDatabase(prisma)
  })

  describe('Given the verification code is invalid', () => {
    it('returns an InvalidVerificationCodeError failure', async () => {
      const { backgroundTaskRunner, flush } =
        createAwaitingBackgroundTaskRunner()

      const result = await buildLogin(backgroundTaskRunner)({
        email: faker.internet.email().toLocaleLowerCase(),
        code: faker.number.int({ min: 100000, max: 999999 }).toString(),
        locale: 'fr',
      })
      await flush()

      expect.assert(!result.success)
      expect(result.error).toBeInstanceOf(InvalidVerificationCodeError)
      expect(addOrUpdateContact).not.toHaveBeenCalled()
      expect(sendEmail).not.toHaveBeenCalled()
      expect(vi.mocked(syncUserData)).not.toHaveBeenCalled()
      expect(vi.mocked(reconcileSimulationsAfterLogin)).not.toHaveBeenCalled()
    })
  })

  describe('Given an existing verified account', () => {
    it('signs the user in, keeps the existing account own id and refreshes the contact without sending a welcome email', async () => {
      const verifiedUser = await userFactory.verified().create()
      const verificationCode = await verificationCodeFactory.create({
        email: verifiedUser.email,
      })

      const { backgroundTaskRunner, flush } =
        createAwaitingBackgroundTaskRunner()
      const result = await buildLogin(backgroundTaskRunner)({
        email: verifiedUser.email,
        code: verificationCode.code,
        locale: 'fr',
      })
      await flush()

      expect.assert(result.success)
      expect(result.data.mode).toBe('signIn')
      expect(result.data.user).toMatchObject({
        id: verifiedUser.id,
        email: verifiedUser.email,
      })
      expect(addOrUpdateContact).toHaveBeenCalledWith({
        email: verifiedUser.email,
        attributes: {
          USER_ID: verifiedUser.id,
        },
      })
      expect(sendEmail).not.toHaveBeenCalled()
      // A sign-in never merges data: there is no session user to reconcile
      // and only a sign-up syncs legacy users.
      expect(vi.mocked(syncUserData)).not.toHaveBeenCalled()
      expect(vi.mocked(reconcileSimulationsAfterLogin)).not.toHaveBeenCalled()
    })

    it('cannot be replayed: a second sign-in with the same code fails', async () => {
      const verifiedUser = await userFactory.verified().create()
      const verificationCode = await verificationCodeFactory.create({
        email: verifiedUser.email,
      })

      const firstRunner = createAwaitingBackgroundTaskRunner()
      const firstResult = await buildLogin(firstRunner.backgroundTaskRunner)({
        email: verifiedUser.email,
        code: verificationCode.code,
        locale: 'fr',
      })
      await firstRunner.flush()

      expect.assert(firstResult.success)

      const { backgroundTaskRunner, flush } =
        createAwaitingBackgroundTaskRunner()
      const replayResult = await buildLogin(backgroundTaskRunner)({
        email: verifiedUser.email,
        code: verificationCode.code,
        locale: 'fr',
      })
      await flush()

      expect.assert(!replayResult.success)
      expect(replayResult.error).toBeInstanceOf(InvalidVerificationCodeError)
      // Neither login reached the reconciliation helpers: the first was a
      // plain sign-in, the replay failed at the code claim.
      expect(vi.mocked(syncUserData)).not.toHaveBeenCalled()
      expect(vi.mocked(reconcileSimulationsAfterLogin)).not.toHaveBeenCalled()
    })

    describe('And the session belongs to an unverified user with simulations', () => {
      it('transfers the unverified user simulations to the signed-in account', async () => {
        const verifiedUser = await userFactory.verified().create()
        const unverifiedUser = await userFactory.create()
        const unverifiedSimulation = await simulationFactory
          .params({ userId: unverifiedUser.id })
          .create()
        const verificationCode = await verificationCodeFactory.create({
          email: verifiedUser.email,
        })

        const { backgroundTaskRunner, flush } =
          createAwaitingBackgroundTaskRunner()
        const result = await buildLogin(backgroundTaskRunner)({
          email: verifiedUser.email,
          code: verificationCode.code,
          locale: 'fr',
          sessionUserId: unverifiedUser.id,
        })
        await flush()

        expect.assert(result.success)

        const simulations = await prisma.simulation.findMany({
          where: { userId: verifiedUser.id },
          select: { id: true, userEmail: true },
        })

        expect(simulations.map(({ id }) => id)).toContain(
          unverifiedSimulation.id
        )
        expect(simulations[0].userEmail).toBe(verifiedUser.email)
        expect(
          await prisma.simulation.findMany({
            where: { userId: unverifiedUser.id },
          })
        ).toHaveLength(0)
        expect(await findUserById(unverifiedUser.id)).toBeNull()
        expect(vi.mocked(reconcileSimulationsAfterLogin)).toHaveBeenCalledWith({
          user: expect.objectContaining({
            id: verifiedUser.id,
            email: verifiedUser.email,
          }),
          previousUserId: unverifiedUser.id,
        })
        // The sign-in branch reconciles only: it never runs the legacy
        // users merge.
        expect(vi.mocked(syncUserData)).not.toHaveBeenCalled()
      })

      it('leaves the account untouched when there is no session userId to reconcile from', async () => {
        const verifiedUser = await userFactory.verified().create()
        const unverifiedUser = await userFactory.create()
        await simulationFactory.create({ userId: unverifiedUser.id })
        const verificationCode = await verificationCodeFactory.create({
          email: verifiedUser.email,
        })

        const { backgroundTaskRunner, flush } =
          createAwaitingBackgroundTaskRunner()
        const result = await buildLogin(backgroundTaskRunner)({
          email: verifiedUser.email,
          code: verificationCode.code,
          locale: 'fr',
        })
        await flush()

        expect.assert(result.success)

        // Without a session userId the reconciliation cannot run: the
        // unverified user keeps their data.
        expect(
          await prisma.simulation.findMany({
            where: { userId: unverifiedUser.id },
          })
        ).toHaveLength(1)
        expect(await findUserById(unverifiedUser.id)).not.toBeNull()
        expect(vi.mocked(syncUserData)).not.toHaveBeenCalled()
        expect(vi.mocked(reconcileSimulationsAfterLogin)).not.toHaveBeenCalled()
      })
    })

    describe('And the session userId already belongs to another verified account', () => {
      it('signs in on the requested account without reconciling the session', async () => {
        const userA = await userFactory.verified().create()
        const userB = await userFactory.verified().create()
        const verificationCode = await verificationCodeFactory.create({
          email: userB.email,
        })

        const { backgroundTaskRunner, flush } =
          createAwaitingBackgroundTaskRunner()
        const result = await buildLogin(backgroundTaskRunner)({
          email: userB.email,
          code: verificationCode.code,
          locale: 'fr',
          sessionUserId: userA.id,
        })
        await flush()

        expect.assert(result.success)
        // The session's userId (userA.id) belongs to account A, so it must
        // not be reconciled into account B: the login answers with the
        // requested account, its own userIdB.
        expect(result.data.user).toMatchObject({
          id: userB.id,
          email: userB.email,
        })
        // Reconciling userA.id into account B would have moved account A's
        // data over and deleted its user row. It must not have run.
        expect(await findUserById(userA.id)).not.toBeNull()
        expect(vi.mocked(syncUserData)).not.toHaveBeenCalled()
        expect(vi.mocked(reconcileSimulationsAfterLogin)).not.toHaveBeenCalled()
      })
    })
  })

  describe('Given no verified account exists for the email', () => {
    describe('And there is no session userId', () => {
      it('signs the user up with a fresh empty verified account', async () => {
        const verificationCode = await verificationCodeFactory.create()

        const { backgroundTaskRunner, flush } =
          createAwaitingBackgroundTaskRunner()
        const result = await buildLogin(backgroundTaskRunner)({
          email: verificationCode.email,
          code: verificationCode.code,
          locale: 'fr',
        })
        await flush()

        expect.assert(result.success)
        expect(result.data.mode).toBe('signUp')

        const createdUser = await findVerifiedUserByEmail(
          { email: verificationCode.email },
          { session: prisma }
        )

        // A fresh identity is generated: the account does not borrow any
        // pre-existing user id.
        expect.assert(createdUser)
        expect(createdUser.id).toBe(result.data.user.id)
        expect(
          await prisma.simulation.findMany({
            where: { userId: result.data.user.id },
          })
        ).toHaveLength(0)
        // The fresh sign-up merges legacy users sharing the email, but has
        // no session user to reconcile from.
        expect(vi.mocked(syncUserData)).toHaveBeenCalledWith({
          user: expect.objectContaining({ id: result.data.user.id }),
          verified: true,
        })
        expect(vi.mocked(reconcileSimulationsAfterLogin)).not.toHaveBeenCalled()
      })
    })

    describe('And the session user id matches no user', () => {
      it('signs the user up as if there were no session: a fresh empty verified account', async () => {
        const verificationCode = await verificationCodeFactory.create()
        const sessionUserId = faker.string.uuid()

        const { backgroundTaskRunner, flush } =
          createAwaitingBackgroundTaskRunner()
        const result = await buildLogin(backgroundTaskRunner)({
          email: verificationCode.email,
          code: verificationCode.code,
          locale: 'fr',
          sessionUserId,
        })
        await flush()

        expect.assert(result.success)
        expect(result.data.mode).toBe('signUp')

        const createdUser = await findVerifiedUserByEmail(
          { email: verificationCode.email },
          { session: prisma }
        )

        // The session userId has no user behind it: there is no identity to
        // convert, so a fresh one is generated - the outcome matches the
        // no-session sign-up above.
        expect.assert(createdUser)
        expect(createdUser.id).toBe(result.data.user.id)
        expect(result.data.user.id).not.toBe(sessionUserId)
        expect(
          await prisma.simulation.findMany({
            where: { userId: result.data.user.id },
          })
        ).toHaveLength(0)
        // The unfound session user leaves nothing to reconcile.
        expect(vi.mocked(syncUserData)).toHaveBeenCalledTimes(1)
        expect(vi.mocked(reconcileSimulationsAfterLogin)).not.toHaveBeenCalled()
      })
    })

    describe('And the session userId belongs to an unverified user', () => {
      it('signs the user up, reusing the session userId as the account id', async () => {
        const unverifiedUser = await userFactory.create()
        const unverifiedSimulation = await simulationFactory
          .params({ userId: unverifiedUser.id })
          .create()
        const verificationCode = await verificationCodeFactory.create()

        const { backgroundTaskRunner, flush } =
          createAwaitingBackgroundTaskRunner()
        const result = await buildLogin(backgroundTaskRunner)({
          email: verificationCode.email,
          code: verificationCode.code,
          locale: 'fr',
          sessionUserId: unverifiedUser.id,
        })
        await flush()

        expect.assert(result.success)
        expect(result.data.mode).toBe('signUp')
        expect(result.data.user.id).toBe(unverifiedUser.id)

        // The verified record is read raw: the repository maps the name from
        // the user row, whereas this asserts the record's own default
        // profile fields.
        const createdUser = await prisma.verifiedUser.findUnique({
          where: { email: verificationCode.email },
        })

        expect(createdUser).toEqual({
          email: verificationCode.email,
          id: unverifiedUser.id,
          name: null,
          optedInForCommunications: false,
          position: null,
          telephone: null,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        })

        // The unverified user row is updated in place, keeping the user's
        // data attached.
        const simulations = await prisma.simulation.findMany({
          where: { userId: unverifiedUser.id },
          select: { id: true },
        })

        expect(simulations).toHaveLength(1)
        expect(simulations[0].id).toBe(unverifiedSimulation.id)
        // The conversion updates the user row in place: the sign-up sync
        // runs, and no reconciliation is needed since the data stays
        // attached to the same id.
        expect(vi.mocked(syncUserData)).toHaveBeenCalledWith({
          user: expect.objectContaining({ id: unverifiedUser.id }),
          verified: true,
        })
        expect(vi.mocked(reconcileSimulationsAfterLogin)).not.toHaveBeenCalled()
      })

      it('invalidates the verification code', async () => {
        const verificationCode = await verificationCodeFactory.create()

        const { backgroundTaskRunner, flush } =
          createAwaitingBackgroundTaskRunner()
        await buildLogin(backgroundTaskRunner)({
          email: verificationCode.email,
          code: verificationCode.code,
          locale: 'fr',
          sessionUserId: faker.string.uuid(),
        })
        await flush()

        // The claimed code is expired: the login lookup no longer finds it.
        expect(
          await findVerificationCode({
            email: verificationCode.email,
            code: verificationCode.code,
            usage: VerificationCodeUsage.login,
          })
        ).toBeNull()
      })

      it('cannot be replayed: a second sign-up with the same code fails', async () => {
        const verificationCode = await verificationCodeFactory.create()
        const sessionUserId = faker.string.uuid()

        const firstRunner = createAwaitingBackgroundTaskRunner()
        const firstResult = await buildLogin(firstRunner.backgroundTaskRunner)({
          email: verificationCode.email,
          code: verificationCode.code,
          locale: 'fr',
          sessionUserId,
        })
        await firstRunner.flush()

        expect.assert(firstResult.success)

        const { backgroundTaskRunner, flush } =
          createAwaitingBackgroundTaskRunner()
        const replayResult = await buildLogin(backgroundTaskRunner)({
          email: verificationCode.email,
          code: verificationCode.code,
          locale: 'fr',
          sessionUserId,
        })
        await flush()

        expect.assert(!replayResult.success)
        expect(replayResult.error).toBeInstanceOf(InvalidVerificationCodeError)
        // Only the first sign-up synced: the replay failed at the code
        // claim.
        expect(vi.mocked(syncUserData)).toHaveBeenCalledTimes(1)
        expect(vi.mocked(reconcileSimulationsAfterLogin)).not.toHaveBeenCalled()
      })

      it('schedules the welcome email and the contact update', async () => {
        const verificationCode = await verificationCodeFactory.create()
        const unverifiedUser = await userFactory.create()

        const { backgroundTaskRunner, flush } =
          createAwaitingBackgroundTaskRunner()
        const result = await buildLogin(backgroundTaskRunner)({
          email: verificationCode.email,
          code: verificationCode.code,
          locale: 'en',
          sessionUserId: unverifiedUser.id,
        })
        await flush()

        expect.assert(result.success)
        expect(sendEmail).toHaveBeenCalledWith({
          email: verificationCode.email,
          templateId: 139,
          params: {
            DASHBOARD_URL: `${origin}/mon-espace`,
          },
        })
        expect(addOrUpdateContact).toHaveBeenCalledWith({
          email: verificationCode.email,
          attributes: {
            USER_ID: unverifiedUser.id,
          },
        })
      })

      it('merges the legacy unverified users sharing the email into the fresh account', async () => {
        const email = faker.internet.email().toLocaleLowerCase()
        // Legacy row: an unverified user with the deprecated user-level
        // email set. No factory fits: an unverified user has no email.
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
        })
        const unverifiedUser = await userFactory.create()

        const { backgroundTaskRunner, flush } =
          createAwaitingBackgroundTaskRunner()
        const result = await buildLogin(backgroundTaskRunner)({
          email: verificationCode.email,
          code: verificationCode.code,
          locale: 'fr',
          sessionUserId: unverifiedUser.id,
        })
        await flush()

        expect.assert(result.success)

        const simulations = await prisma.simulation.findMany({
          where: { userId: unverifiedUser.id },
          select: { id: true },
        })

        expect(simulations.map(({ id }) => id)).toContain(legacySimulation.id)
        expect(await findUserById(legacyUser.id)).toBeNull()
        // The merge runs through the sign-up sync, not the sign-in
        // reconciliation: syncUserData receives the freshly converted
        // account - the session user's id now carrying the login email.
        expect(vi.mocked(syncUserData)).toHaveBeenCalledTimes(1)
        expect(vi.mocked(syncUserData)).toHaveBeenCalledWith({
          user: expect.objectContaining({
            id: unverifiedUser.id,
            email: verificationCode.email,
          }),
          verified: true,
        })
        expect(vi.mocked(reconcileSimulationsAfterLogin)).not.toHaveBeenCalled()
      })
    })

    describe('And the session userId already belongs to another verified account', () => {
      it('signs the user up with a fresh userId instead of reusing the taken one, without transferring the session user data', async () => {
        const userA = await userFactory.verified().create()
        const userASimulation = await simulationFactory
          .params({ userId: userA.id })
          .create()
        const verificationCode = await verificationCodeFactory.create()

        const { backgroundTaskRunner, flush } =
          createAwaitingBackgroundTaskRunner()
        const result = await buildLogin(backgroundTaskRunner)({
          email: verificationCode.email,
          code: verificationCode.code,
          locale: 'fr',
          sessionUserId: userA.id,
        })
        await flush()

        expect.assert(result.success)
        expect(result.data.mode).toBe('signUp')

        // The invariant holds: the new account must not share userA.id with
        // account A.
        expect(result.data.user.id).not.toBe(userA.id)

        const createdUser = await findVerifiedUserByEmail(
          { email: verificationCode.email },
          { session: prisma }
        )

        expect.assert(createdUser)
        expect(createdUser.id).toBe(result.data.user.id)

        // The session's data belongs to account A: none of it may move to
        // the fresh account, and account A must survive the sign-up.
        expect(
          (
            await prisma.simulation.findMany({
              where: { userId: userA.id },
              select: { id: true },
            })
          ).map(({ id }) => id)
        ).toEqual([userASimulation.id])
        expect(
          await prisma.simulation.findMany({
            where: { userId: result.data.user.id },
          })
        ).toHaveLength(0)
        expect(await findUserById(userA.id)).not.toBeNull()
        expect(vi.mocked(syncUserData)).toHaveBeenCalledWith({
          user: expect.objectContaining({ id: result.data.user.id }),
          verified: true,
        })
        // The fresh account must not inherit account A's data.
        expect(vi.mocked(reconcileSimulationsAfterLogin)).not.toHaveBeenCalled()
      })
    })
  })

  describe('Given the email side effects fail', () => {
    it('still succeeds and captures the errors', async () => {
      const verificationCode = await verificationCodeFactory.create()

      sendEmail.mockResolvedValueOnce(
        failure(new EmailRequestError('Brevo unavailable'))
      )
      addOrUpdateContact.mockResolvedValueOnce(
        failure(new EmailRequestError('Brevo unavailable'))
      )

      const { backgroundTaskRunner, flush } =
        createAwaitingBackgroundTaskRunner()
      const result = await buildLogin(backgroundTaskRunner)({
        email: verificationCode.email,
        code: verificationCode.code,
        locale: 'fr',
        sessionUserId: faker.string.uuid(),
      })
      await flush()

      expect.assert(result.success)

      const createdUser = await findVerifiedUserByEmail(
        { email: verificationCode.email },
        { session: prisma }
      )
      expect.assert(createdUser)

      expect(captureException).toHaveBeenCalledTimes(2)
      expect(logger.error).toHaveBeenCalledWith(
        'Failed to settle: side effects',
        expect.objectContaining({ error: expect.any(Error) })
      )
    })
  })
})
