import { randomUUID } from 'node:crypto'

import type { BackgroundTaskRunner } from '../../../lib/background-task-runner.ts'
import { maskEmail } from '../../../lib/pii.ts'
import type { Result } from '../../../lib/result.ts'
import { success } from '../../../lib/result.ts'
import { runSideEffect } from '../../../lib/run-side-effect.ts'
import { transaction } from '../../../lib/transaction.ts'
import { VerificationCodeUsage } from '../../../prisma/generated/client.ts'
import { Attributes } from '../../emails/email.constant.ts'
import type { AddOrUpdateContact, SendEmail } from '../../emails/types.ts'
import type { ISOSupportedLanguage } from '../../geo/types/language.ts'
import type { Logger } from '../../logger/index.ts'
import { createSimulationCompletedEmail } from '../../simulations/emails/simulation-emails.ts'
import { findLatestCompletedSimulation } from '../../simulations/repository/simulation.repository.ts'
import {
  createOrUpdateUser,
  findUserById,
  findVerifiedUserByEmail,
} from '../../users/repositories/users.repository.ts'
import { createReconcileSimulationsAfterLogin } from '../../users/services/reconcile-simulations-after-login.service.ts'
import { createSyncUserData } from '../../users/services/sync-user-data.service.ts'
import type { VerifiedUser } from '../../users/types/user.ts'
import { createWelcomeEmail } from '../emails/auth-emails.ts'
import type { LoginError } from '../errors/login.error.ts'
import type { Intent } from '../schemas/auth.schema.ts'
import { claimVerificationCode } from './claim-verification-code.service.ts'

export type LoginMode = 'signIn' | 'signUp'

type LoginResult = {
  user: VerifiedUser
  mode: LoginMode
}

interface LoginDependencies {
  logger: Logger
  sendEmail: SendEmail
  addOrUpdateContact: AddOrUpdateContact
  /** Public origin the welcome email's dashboard link points to. */
  origin: string
  /** Runs the post-login side effects outside of the request lifecycle. */
  backgroundTaskRunner: BackgroundTaskRunner
}

export function createLogin({
  logger,
  sendEmail,
  addOrUpdateContact,
  origin,
  backgroundTaskRunner,
}: LoginDependencies) {
  return logger.withSpan(
    'core.service.login',
    async ({
      email,
      code,
      locale,
      intent,
      sessionUserId,
      logger,
    }: {
      email: string
      code: string
      locale: ISOSupportedLanguage
      /** Why the user logs in: decides which post-login email is sent. */
      intent: Intent
      /**
       * The current session's userId. A session user that cannot be found is
       * the same as no session.
       */
      sessionUserId?: string
      logger: Logger
    }): Promise<Result<LoginResult, LoginError>> => {
      const account = await transaction(async (session) => {
        // Single-use by construction, on both branches: the code is claimed
        // atomically, inside the transaction, before the sign-in/sign-up
        // branch runs. A replayed code is already expired here, and a
        // concurrent request racing on the same code loses the claim
        // (count !== 1) however it interleaves with this one - there is no
        // read-then-write gap to exploit.
        const claimedCode = await claimVerificationCode(
          {
            email,
            code,
            usage: VerificationCodeUsage.login,
          },
          { session }
        )
        if (!claimedCode.success) return claimedCode

        const [existingVerifiedUser, rawSessionUser] = await Promise.all([
          findVerifiedUserByEmail({ email }, { session }),
          sessionUserId ? findUserById(sessionUserId, { session }) : null,
        ])

        const sessionUser = rawSessionUser?.deletedAt ? null : rawSessionUser

        // The two identities the decision below is made for: each of its lines
        // carries them, flattened as `ngc.sessionUser.email`.
        const decisionLogger = logger.child({
          // Only the id: the lookup matched this email on a verified account,
          // so both fields would repeat the query.
          existingVerifiedUser: existingVerifiedUser
            ? { id: existingVerifiedUser.id }
            : undefined,
          sessionUser: sessionUser
            ? {
                id: sessionUser.id,
                type: sessionUser.type,
                email: sessionUser.email
                  ? maskEmail(sessionUser.email)
                  : undefined,
              }
            : undefined,
        })

        decisionLogger.info('Login users found')

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
          if (sessionUser?.type === 'verified') {
            decisionLogger.warn(
              'Login account swap: the session user belongs to another verified account'
            )
          }
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
              sessionUser?.type === 'unverified'
                ? sessionUser.id
                : randomUUID(),
            email,
          },
          { session }
        )

        if (sessionUser?.type === 'verified') {
          decisionLogger.warn(
            'Sign-up with a fresh identity: the session user belongs to another verified account',
            { signedUpUserId: newUser.id }
          )
        }

        return success({
          user: newUser,
          mode: 'signUp' as const,
          reconcileUserId: undefined,
        })
      })

      if (!account.success) return account

      const { user, mode, reconcileUserId } = account.data

      // The account the login resolved to: every step below is about it, and
      // carries it - lines and spans alike.
      const userLogger = logger.child({ userId: user.id })

      if (mode === 'signUp') {
        // merge legacy unverified users.
        await createSyncUserData({ logger: userLogger })({
          user,
          verified: true,
        })
      }

      if (mode === 'signIn' && reconcileUserId) {
        // transfer the unverified user's data to the verified user.
        await createReconcileSimulationsAfterLogin({ logger: userLogger })({
          userId: user.id,
          previousUserId: reconcileUserId,
        })
      }

      runSideEffect(
        'addOrUpdateContact',
        { logger: userLogger, backgroundTaskRunner },
        () =>
          addOrUpdateContact({
            email: user.email,
            attributes: {
              [Attributes.USER_ID]: user.id,
            },
          })
      )

      runSideEffect(
        'signUpEmail',
        { logger: userLogger, backgroundTaskRunner },
        async () => {
          if (mode !== 'signUp') return success()

          // The simulation completed email is the point of the
          // save-simulation intent: the user signed up right after
          // finishing a simulation to save it. Every other intent signs
          // up for something else - a poll, a group, an organisation, a
          // plain account - and only gets the welcome email.
          const lastCompletedSimulation =
            intent === 'save-simulation'
              ? await findLatestCompletedSimulation({ userId: user.id })
              : null

          if (intent === 'save-simulation' && !lastCompletedSimulation) {
            // The user signed up to save a simulation, yet none is found:
            // unexpected enough to investigate - the welcome email is sent
            // as a fallback.
            logger.warn(
              'Save-simulation sign-up without any completed simulation'
            )
          }

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
        }
      )

      return success({ user, mode })
    }
  )
}
