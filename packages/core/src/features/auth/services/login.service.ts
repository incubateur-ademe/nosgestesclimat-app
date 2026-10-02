import { randomUUID } from 'node:crypto'

import type { BackgroundTaskRunner } from '../../../lib/background-task-runner.ts'
import { maskEmail } from '../../../lib/pii.ts'
import type { Result } from '../../../lib/result.ts'
import { failure, success } from '../../../lib/result.ts'
import { createSettle } from '../../../lib/settle.ts'
import { transaction } from '../../../lib/transaction.ts'
import { VerificationCodeUsage } from '../../../prisma/generated/client.ts'
import { Attributes } from '../../emails/email.constant.ts'
import type { AddOrUpdateContact, SendEmail } from '../../emails/types.ts'
import type { ISOSupportedLanguage } from '../../geo/types/language.ts'
import type { CaptureException, Logger } from '../../logger/index.ts'
import { createSimulationCompletedEmail } from '../../simulations/emails/simulation-emails.ts'
import { findLatestCompletedSimulation } from '../../simulations/repository/simulation.repository.ts'
import {
  createOrUpdateUser,
  findUserById,
  findVerifiedUserByEmail,
} from '../../users/repositories/users.repository.ts'
import { reconcileSimulationsAfterLogin } from '../../users/services/reconcile-simulations-after-login.service.ts'
import { syncUserData } from '../../users/services/sync-user-data.service.ts'
import type { VerifiedUser } from '../../users/types/user.ts'
import { createWelcomeEmail } from '../emails/auth-emails.ts'
import type { LoginError } from '../errors/login.error.ts'
import { InvalidVerificationCodeError } from '../errors/login.error.ts'
import { claimVerificationCode } from '../repositories/verification-codes.repository.ts'
import { verifyCode } from './verify-code.service.ts'

export type LoginMode = 'signIn' | 'signUp'

type LoginResult = {
  user: VerifiedUser
  mode: LoginMode
}

interface LoginDependencies {
  logger: Logger
  captureException: CaptureException
  sendEmail: SendEmail
  addOrUpdateContact: AddOrUpdateContact
  /** Public origin the welcome email's dashboard link points to. */
  origin: string
  /** Runs the post-login side effects outside of the request lifecycle. */
  backgroundTaskRunner: BackgroundTaskRunner
}

export function createLogin({
  logger,
  captureException,
  sendEmail,
  addOrUpdateContact,
  origin,
  backgroundTaskRunner,
}: LoginDependencies) {
  const settle = createSettle({ logger, captureException })

  return async function login({
    email,
    code,
    locale,
    sessionUserId,
  }: {
    email: string
    code: string
    locale: ISOSupportedLanguage
    /**
     * The current session's userId. A session user that cannot be found is
     * the same as no session.
     */
    sessionUserId?: string
  }): Promise<Result<LoginResult, LoginError>> {
    const verificationCode = await verifyCode({
      email,
      code,
      usage: VerificationCodeUsage.login,
    })
    if (!verificationCode.success) {
      return failure(verificationCode.error)
    }

    const account = await transaction(async (session) => {
      // Single-use by construction, on both branches: the code is claimed
      // atomically, inside the transaction, before the sign-in/sign-up
      // branch runs. A replayed code is already expired here, and a
      // concurrent request racing on the same code loses the claim
      // (count !== 1) however it interleaves with this one - there is no
      // read-then-write gap to exploit. This is the authoritative check:
      // the earlier verifyCode lookup outside the transaction is only a
      // fast-fail.
      const claimed = await claimVerificationCode(
        { id: verificationCode.data.id, usage: VerificationCodeUsage.login },
        { session }
      )
      if (!claimed) {
        return failure(new InvalidVerificationCodeError())
      }

      const [existingVerifiedUser, sessionUser] = await Promise.all([
        findVerifiedUserByEmail({ email }, { session }),
        sessionUserId ? findUserById(sessionUserId, { session }) : null,
      ])

      logger.info('Login users found', {
        existingVerifiedUserId: existingVerifiedUser?.id,
        sessionUserId: sessionUser?.id,
        sessionUserType: sessionUser?.type,
        sessionUserEmail: sessionUser?.email
          ? maskEmail(sessionUser.email)
          : undefined,
      })

      // The sign-in / sign-up decision matrix
      // A session whose user cannot be found counts as no session.
      //
      // no verified user found + no session         -> sign up (new empty verified user)
      // no verified user found + unverified session -> sign up by converting the unverified user
      // no verified user found + verified session   -> sign up (new empty verified user)
      // verified user found    + no session         -> sign in
      // verified user found    + unverified session -> sign in and transfer the unverified user's data
      // verified user found    + verified session   -> sign in to the verified user found (account swap)
      if (existingVerifiedUser) {
        // Sign in
        // The existing account's own id wins - never generate a
        // fresh one. Only an unverified session user's data is reconciled
        // into the signed-in account: a verified session user is another
        // account being swapped away from, and its data stays put.
        return success({
          user: existingVerifiedUser,
          mode: 'signIn' as const,
          reconcileUserId:
            sessionUser?.type === 'unverified' ? sessionUser.id : undefined,
        })
      }

      // Sign up
      // An unverified session user is converted in place - the
      // anonymous user row is updated in place, keeping the user's data
      // attached. Every other session (none, unfound, or already verified)
      // starts a fresh identity: a verified session user belongs to another
      // account, and reusing its id would map one id to several accounts.
      const newUser = await createOrUpdateUser(
        {
          type: 'verified',
          id:
            sessionUser?.type === 'unverified' ? sessionUser.id : randomUUID(),
          email,
        },
        { session }
      )

      return success({
        user: newUser,
        mode: 'signUp' as const,
        reconcileUserId: undefined,
      })
    })

    if (!account.success) return failure(account.error)

    const { user, mode, reconcileUserId } = account.data

    if (mode === 'signUp') {
      // merge legacy unverified users.
      await syncUserData({ user, verified: true })
    }

    if (mode === 'signIn' && reconcileUserId) {
      // transfer the unverified user's data to the verified user.
      await reconcileSimulationsAfterLogin({
        user,
        previousUserId: reconcileUserId,
      })
    }

    backgroundTaskRunner(async () => {
      await settle('side effects', [
        addOrUpdateContact({
          email: user.email,
          attributes: {
            [Attributes.USER_ID]: user.id,
          },
        }),
        (async () => {
          if (mode !== 'signUp') return success()

          // A user that just signed up after completing a simulation gets
          // an email with a link to the simulation in order to find it again
          const lastCompletedSimulation = await findLatestCompletedSimulation({
            userId: user.id,
          })

          if (lastCompletedSimulation) {
            return sendEmail(
              createSimulationCompletedEmail({
                email: user.email,
                origin,
                locale,
                simulationId: lastCompletedSimulation.id,
                computedResults: lastCompletedSimulation.computedResults,
              })
            )
          }

          return sendEmail(
            createWelcomeEmail({ locale, email: user.email, origin })
          )
        })(),
      ])
    })

    return success({ user, mode })
  }
}
