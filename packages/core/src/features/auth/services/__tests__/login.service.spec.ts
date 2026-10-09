import { faker } from '@faker-js/faker'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { BackgroundTaskRunner } from '../../../../lib/background-task-runner.ts'
import { failure, success } from '../../../../lib/result.ts'
import { prisma } from '../../../../prisma/client.ts'
import { VerificationCodeUsage } from '../../../../prisma/generated/client.ts'
import { emptyDatabase } from '../../../../test-utils/empty-database.ts'
import { TemplateIds } from '../../../emails/email.constant.ts'
import { EmailRequestError } from '../../../emails/errors.ts'
import { mapComputedResultsToContactAttributes } from '../../../simulations/emails/map-computed-results-to-contact-attributes.ts'
import { computedResultsFactory } from '../../../simulations/factories/computed-results.factory.ts'
import { simulationFactory } from '../../../simulations/factories/simulation.factory.ts'
import { userFactory } from '../../../users/factories/user.factory.ts'
import { findVerifiedUserByEmail } from '../../../users/repositories/users.repository.ts'
import { reconcileSimulationsAfterLogin } from '../../../users/services/reconcile-simulations-after-login.service.ts'
import { syncUserData } from '../../../users/services/sync-user-data.service.ts'
import { InvalidVerificationCodeError } from '../../errors/login.error.ts'
import { verificationCodeFactory } from '../../factories/verification-code.factory.ts'
import { findValidVerificationCode } from '../../repositories/verification-codes.repository.ts'
import { createLogin } from '../login.service.ts'

// Both reconciliation helpers are fully mocked: their database effects are
// covered by their own specs. This file only asserts that the login service
// reaches for them when it should - and never when it should not.
vi.mock('../../../users/services/sync-user-data.service.ts', () => ({
  syncUserData: vi.fn(),
}))

vi.mock(
  '../../../users/services/reconcile-simulations-after-login.service.ts',
  () => ({
    reconcileSimulationsAfterLogin: vi.fn(),
  })
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

describe('login', () => {
  let pendingTasks: Array<Promise<void>>

  // The runner collects the scheduled tasks so the tests can await them: the
  // email side effects stay assertable while the service keeps scheduling
  // without awaiting.
  const backgroundTaskRunner: BackgroundTaskRunner = (task) => {
    pendingTasks.push(task())
  }

  const flushBackgroundTasks = async () => {
    await Promise.all(pendingTasks)
    pendingTasks = []
  }

  const login = createLogin({
    logger,
    captureException,
    sendEmail,
    addOrUpdateContact,
    origin,
    backgroundTaskRunner,
  })

  beforeEach(() => {
    pendingTasks = []
  })

  afterEach(async () => {
    await flushBackgroundTasks()
    await emptyDatabase(prisma)
    vi.clearAllMocks()
  })

  describe('Given the verification code is invalid', () => {
    const loginWithInvalidCode = async ({
      email,
      code,
    }: {
      email: string
      code: string
    }) => {
      const result = await login({
        email,
        code,
        locale: 'fr',
        intent: 'create-account',
      })

      expect(addOrUpdateContact).not.toHaveBeenCalled()
      expect(sendEmail).not.toHaveBeenCalled()
      expect(vi.mocked(syncUserData)).not.toHaveBeenCalled()
      expect(vi.mocked(reconcileSimulationsAfterLogin)).not.toHaveBeenCalled()
      // The failure short-circuits at the code claim: the user lookup log
      // never runs.
      expect(logger.info).not.toHaveBeenCalled()

      return result
    }

    it('returns an InvalidVerificationCodeError when no code was ever requested', async () => {
      const result = await loginWithInvalidCode({
        email: faker.internet.email().toLocaleLowerCase(),
        code: faker.number.int({ min: 100000, max: 999999 }).toString(),
      })

      expect.assert(!result.success)
      expect(result.error).toBeInstanceOf(InvalidVerificationCodeError)
    })

    it('returns an InvalidVerificationCodeError when the code does not match the one sent', async () => {
      const verificationCode = await verificationCodeFactory.create({
        code: '123456',
      })

      const result = await loginWithInvalidCode({
        email: verificationCode.email,
        code: '654321',
      })

      expect.assert(!result.success)
      expect(result.error).toBeInstanceOf(InvalidVerificationCodeError)
    })

    it('returns an InvalidVerificationCodeError when the code is expired', async () => {
      const verificationCode = await verificationCodeFactory.create({
        expirationDate: new Date(Date.now() - 1000),
      })

      const result = await loginWithInvalidCode({
        email: verificationCode.email,
        code: verificationCode.code,
      })

      expect.assert(!result.success)
      expect(result.error).toBeInstanceOf(InvalidVerificationCodeError)
    })

    it('returns an InvalidVerificationCodeError when the code was issued for another usage', async () => {
      const verificationCode = await verificationCodeFactory.create({
        usage: VerificationCodeUsage.newsletter,
      })

      const result = await loginWithInvalidCode({
        email: verificationCode.email,
        code: verificationCode.code,
      })

      expect.assert(!result.success)
      expect(result.error).toBeInstanceOf(InvalidVerificationCodeError)
    })
  })

  describe('Given an existing verified account', () => {
    it('signs the user in, keeps the existing account own id and refreshes the contact without sending a welcome email', async () => {
      const verifiedUser = await userFactory.verified().create()
      const verificationCode = await verificationCodeFactory.create({
        email: verifiedUser.email,
      })

      const result = await login({
        email: verifiedUser.email,
        code: verificationCode.code,
        locale: 'fr',
        intent: 'create-account',
      })
      await flushBackgroundTasks()

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

    it('sends no email on a save-simulation sign-in', async () => {
      const verifiedUser = await userFactory.verified().create()
      const computedResults = computedResultsFactory.valid().build()
      await simulationFactory
        .params({ userId: verifiedUser.id, computedResults })
        .completed()
        .create()
      const verificationCode = await verificationCodeFactory.create({
        email: verifiedUser.email,
      })

      const result = await login({
        email: verifiedUser.email,
        code: verificationCode.code,
        locale: 'fr',
        intent: 'save-simulation',
      })
      await flushBackgroundTasks()

      expect.assert(result.success)
      // The simulation completed email belongs to the save-simulation
      // sign-up only: a sign-in never receives it, even with a completed
      // simulation behind it.
      expect(sendEmail).not.toHaveBeenCalled()
    })

    it('cannot be replayed: a second sign-in with the same code fails', async () => {
      const verifiedUser = await userFactory.verified().create()
      const verificationCode = await verificationCodeFactory.create({
        email: verifiedUser.email,
      })

      const firstResult = await login({
        email: verifiedUser.email,
        code: verificationCode.code,
        locale: 'fr',
        intent: 'create-account',
      })

      expect.assert(firstResult.success)

      const replayResult = await login({
        email: verifiedUser.email,
        code: verificationCode.code,
        locale: 'fr',
        intent: 'create-account',
      })

      expect.assert(!replayResult.success)
      expect(replayResult.error).toBeInstanceOf(InvalidVerificationCodeError)
      // The claimed code is invalidated: the login lookup no longer
      // finds it.
      expect(
        await findValidVerificationCode({
          email: verifiedUser.email,
          code: verificationCode.code,
          usage: VerificationCodeUsage.login,
        })
      ).toBeNull()
      // Neither login reached the reconciliation helpers: the first was a
      // plain sign-in, the replay failed at the code claim.
      expect(vi.mocked(syncUserData)).not.toHaveBeenCalled()
      expect(vi.mocked(reconcileSimulationsAfterLogin)).not.toHaveBeenCalled()
    })

    describe('And the session belongs to an unverified user', () => {
      it('signs in on the existing account and delegates the session data transfer to the reconciliation', async () => {
        const verifiedUser = await userFactory.verified().create()
        const unverifiedUser = await userFactory.create()
        const verificationCode = await verificationCodeFactory.create({
          email: verifiedUser.email,
        })

        const result = await login({
          email: verifiedUser.email,
          code: verificationCode.code,
          locale: 'fr',
          intent: 'create-account',
          sessionUserId: unverifiedUser.id,
        })

        expect.assert(result.success)
        expect(result.data.mode).toBe('signIn')
        expect(result.data.user).toMatchObject({
          id: verifiedUser.id,
          email: verifiedUser.email,
        })
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
    })

    describe('And the session userId already belongs to another verified account', () => {
      it('signs in on the requested account without reconciling the session and warns about the swap', async () => {
        const userA = await userFactory.verified().create()
        const userB = await userFactory.verified().create()
        const verificationCode = await verificationCodeFactory.create({
          email: userB.email,
        })

        const result = await login({
          email: userB.email,
          code: verificationCode.code,
          locale: 'fr',
          intent: 'create-account',
          sessionUserId: userA.id,
        })

        expect.assert(result.success)
        // The session's userId (userA.id) belongs to account A, so it must
        // not be reconciled into account B: the login answers with the
        // requested account, its own userIdB.
        expect(result.data.user).toMatchObject({
          id: userB.id,
          email: userB.email,
        })
        // Swapping between verified accounts is surprising enough to be
        // logged.
        expect(logger.warn).toHaveBeenCalledWith(
          'Login account swap: the session user belongs to another verified account',
          expect.objectContaining({
            sessionUserId: userA.id,
            signedInUserId: userB.id,
          })
        )
        // Reconciling userA.id into account B would have moved account A's
        // data over. It must not have run.
        expect(vi.mocked(syncUserData)).not.toHaveBeenCalled()
        expect(vi.mocked(reconcileSimulationsAfterLogin)).not.toHaveBeenCalled()
      })
    })
  })

  describe('Given no verified account exists for the email', () => {
    describe('And there is no session userId', () => {
      it('signs the user up with a fresh account and syncs it', async () => {
        const verificationCode = await verificationCodeFactory.create()

        const result = await login({
          email: verificationCode.email,
          code: verificationCode.code,
          locale: 'fr',
          intent: 'create-account',
        })

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
        // The fresh sign-up merges the legacy users sharing the email, but
        // has no session user to reconcile from.
        expect(vi.mocked(syncUserData)).toHaveBeenCalledWith({
          user: expect.objectContaining({ id: createdUser.id }),
          verified: true,
        })
        expect(vi.mocked(reconcileSimulationsAfterLogin)).not.toHaveBeenCalled()
      })
    })

    describe('And the session user id matches no user', () => {
      it('signs the user up as if there were no session: a fresh account with a fresh id', async () => {
        const verificationCode = await verificationCodeFactory.create()
        const sessionUserId = faker.string.uuid()

        const result = await login({
          email: verificationCode.email,
          code: verificationCode.code,
          locale: 'fr',
          intent: 'create-account',
          sessionUserId,
        })

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
        // The unfound session user leaves nothing to reconcile.
        expect(vi.mocked(syncUserData)).toHaveBeenCalledTimes(1)
        expect(vi.mocked(reconcileSimulationsAfterLogin)).not.toHaveBeenCalled()
      })
    })

    describe('And the session userId belongs to an unverified user', () => {
      it('signs the user up, reusing the session userId as the account id', async () => {
        const unverifiedUser = await userFactory.create()
        const verificationCode = await verificationCodeFactory.create()

        const result = await login({
          email: verificationCode.email,
          code: verificationCode.code,
          locale: 'fr',
          intent: 'create-account',
          sessionUserId: unverifiedUser.id,
        })

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
        // The conversion updates the user row in place, keeping the user's
        // data attached: the sign-up sync runs, and no reconciliation is
        // needed since the data stays attached to the same id.
        expect(vi.mocked(syncUserData)).toHaveBeenCalledWith({
          user: expect.objectContaining({ id: unverifiedUser.id }),
          verified: true,
        })
        expect(vi.mocked(reconcileSimulationsAfterLogin)).not.toHaveBeenCalled()
      })

      it('cannot be replayed: a second sign-up with the same code fails', async () => {
        const verificationCode = await verificationCodeFactory.create()
        const sessionUserId = faker.string.uuid()

        const firstResult = await login({
          email: verificationCode.email,
          code: verificationCode.code,
          locale: 'fr',
          intent: 'create-account',
          sessionUserId,
        })

        expect.assert(firstResult.success)

        const replayResult = await login({
          email: verificationCode.email,
          code: verificationCode.code,
          locale: 'fr',
          intent: 'create-account',
          sessionUserId,
        })

        expect.assert(!replayResult.success)
        expect(replayResult.error).toBeInstanceOf(InvalidVerificationCodeError)
        // The claimed code is invalidated: the login lookup no longer
        // finds it.
        expect(
          await findValidVerificationCode({
            email: verificationCode.email,
            code: verificationCode.code,
            usage: VerificationCodeUsage.login,
          })
        ).toBeNull()
        // Only the first sign-up synced: the replay failed at the code
        // claim.
        expect(vi.mocked(syncUserData)).toHaveBeenCalledTimes(1)
        expect(vi.mocked(reconcileSimulationsAfterLogin)).not.toHaveBeenCalled()
      })

      it('schedules the welcome email and the contact update', async () => {
        const verificationCode = await verificationCodeFactory.create()
        const unverifiedUser = await userFactory.create()

        const result = await login({
          email: verificationCode.email,
          code: verificationCode.code,
          locale: 'en',
          intent: 'create-account',
          sessionUserId: unverifiedUser.id,
        })
        await flushBackgroundTasks()

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

      it('sends the simulation completed email on a save-simulation sign-up with a completed simulation', async () => {
        const verificationCode = await verificationCodeFactory.create()
        const unverifiedUser = await userFactory.create()
        const computedResults = computedResultsFactory.valid().build()
        const simulation = await simulationFactory
          .params({ userId: unverifiedUser.id, computedResults })
          .completed()
          .create()

        const result = await login({
          email: verificationCode.email,
          code: verificationCode.code,
          locale: 'fr',
          intent: 'save-simulation',
          sessionUserId: unverifiedUser.id,
        })
        await flushBackgroundTasks()

        expect.assert(result.success)
        expect(sendEmail).toHaveBeenCalledTimes(1)
        expect(sendEmail).toHaveBeenCalledWith({
          email: verificationCode.email,
          templateId: TemplateIds.fr.SIGN_UP_SIMULATION_COMPLETED,
          params: {
            SIMULATION_URL: expect.stringContaining(
              `${origin}/fin?sid=${simulation.id}`
            ),
            DASHBOARD_URL: `${origin}/mon-espace`,
            ...mapComputedResultsToContactAttributes(computedResults, 'fr'),
          },
        })
      })

      it('sends the simulation completed email in the language of the request', async () => {
        const verificationCode = await verificationCodeFactory.create()
        const unverifiedUser = await userFactory.create()
        await simulationFactory
          .params({ userId: unverifiedUser.id })
          .completed()
          .withValidComputedResults()
          .create()

        const result = await login({
          email: verificationCode.email,
          code: verificationCode.code,
          locale: 'en',
          intent: 'save-simulation',
          sessionUserId: unverifiedUser.id,
        })
        await flushBackgroundTasks()

        expect.assert(result.success)
        expect(sendEmail).toHaveBeenCalledWith(
          expect.objectContaining({
            templateId: TemplateIds.en.SIGN_UP_SIMULATION_COMPLETED,
          })
        )
      })

      it('sends the welcome email, not the simulation completed email, when the save-simulation sign-up has no completed simulation', async () => {
        const verificationCode = await verificationCodeFactory.create()
        const unverifiedUser = await userFactory.create()
        await simulationFactory
          .params({ userId: unverifiedUser.id })
          .started()
          .withValidComputedResults()
          .create()

        const result = await login({
          email: verificationCode.email,
          code: verificationCode.code,
          locale: 'fr',
          intent: 'save-simulation',
          sessionUserId: unverifiedUser.id,
        })
        await flushBackgroundTasks()

        expect.assert(result.success)
        // No simulation behind a save-simulation sign-up is unexpected
        // enough to be logged.
        expect(logger.warn).toHaveBeenCalledWith(
          'Save-simulation sign-up without any completed simulation',
          { userId: unverifiedUser.id }
        )
        expect(sendEmail).toHaveBeenCalledTimes(1)
        expect(sendEmail).toHaveBeenCalledWith({
          email: verificationCode.email,
          templateId: TemplateIds.fr.SIGN_UP,
          params: {
            DASHBOARD_URL: `${origin}/mon-espace`,
          },
        })
      })

      it('sends the welcome email, not the simulation completed email, on a sign-up whose intent is not save-simulation', async () => {
        const verificationCode = await verificationCodeFactory.create()
        const unverifiedUser = await userFactory.create()
        await simulationFactory
          .params({ userId: unverifiedUser.id })
          .completed()
          .withValidComputedResults()
          .create()

        const result = await login({
          email: verificationCode.email,
          code: verificationCode.code,
          locale: 'fr',
          intent: 'create-account',
          sessionUserId: unverifiedUser.id,
        })
        await flushBackgroundTasks()

        expect.assert(result.success)
        expect(sendEmail).toHaveBeenCalledTimes(1)
        expect(sendEmail).toHaveBeenCalledWith({
          email: verificationCode.email,
          templateId: TemplateIds.fr.SIGN_UP,
          params: {
            DASHBOARD_URL: `${origin}/mon-espace`,
          },
        })
      })
    })

    describe('And the session userId already belongs to another verified account', () => {
      it('signs the user up with a fresh userId instead of reusing the taken one, without transferring the session user data', async () => {
        const userA = await userFactory.verified().create()
        const verificationCode = await verificationCodeFactory.create()

        const result = await login({
          email: verificationCode.email,
          code: verificationCode.code,
          locale: 'fr',
          intent: 'create-account',
          sessionUserId: userA.id,
        })

        expect.assert(result.success)
        expect(result.data.mode).toBe('signUp')

        // The invariant holds: the new account must not share userA.id with
        // account A.
        expect(result.data.user.id).not.toBe(userA.id)

        // Signing up while the session belongs to another verified account
        // is surprising enough to be logged.
        expect(logger.warn).toHaveBeenCalledWith(
          'Sign-up with a fresh identity: the session user belongs to another verified account',
          expect.objectContaining({
            sessionUserId: userA.id,
            signedUpUserId: result.data.user.id,
          })
        )

        const createdUser = await findVerifiedUserByEmail(
          { email: verificationCode.email },
          { session: prisma }
        )

        expect.assert(createdUser)
        expect(createdUser.id).toBe(result.data.user.id)
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

      const contactError = new EmailRequestError('Brevo unavailable')
      const emailError = new EmailRequestError('Brevo unavailable')

      addOrUpdateContact.mockResolvedValueOnce(failure(contactError))
      sendEmail.mockResolvedValueOnce(failure(emailError))

      const result = await login({
        email: verificationCode.email,
        code: verificationCode.code,
        locale: 'fr',
        intent: 'create-account',
        sessionUserId: faker.string.uuid(),
      })
      await flushBackgroundTasks()

      expect.assert(result.success)

      const createdUser = await findVerifiedUserByEmail(
        { email: verificationCode.email },
        { session: prisma }
      )
      expect.assert(createdUser)

      expect(captureException).toHaveBeenCalledTimes(2)
      expect(captureException).toHaveBeenCalledWith(contactError)
      expect(captureException).toHaveBeenCalledWith(emailError)
      expect(logger.error).toHaveBeenCalledWith(
        'Failed to settle: side effects',
        {
          index: 0,
          error: contactError,
        }
      )
      expect(logger.error).toHaveBeenCalledWith(
        'Failed to settle: side effects',
        {
          index: 1,
          error: emailError,
        }
      )
    })
  })
})
