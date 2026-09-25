import { randomUUID } from 'node:crypto'

import type { BackgroundTaskRunner } from '../../../lib/background-task-runner.ts'
import type { Result } from '../../../lib/result.ts'
import { failure, success } from '../../../lib/result.ts'
import type { Transaction } from '../../../lib/transaction.ts'
import { transaction } from '../../../lib/transaction.ts'
import { prisma } from '../../../prisma/client.ts'
import type {
  Prisma,
  VerificationCode,
} from '../../../prisma/generated/client.ts'
import {
  VerificationCodeMode,
  VerificationCodeUsage,
} from '../../../prisma/generated/client.ts'
import { isPrismaErrorNotFound } from '../../../prisma/utils.ts'
import type { ISOSupportedLanguage } from '../../geo/types/language.ts'
import type { CaptureException, Logger } from '../../logger/index.ts'
import {
  createOrUpdateVerifiedUser,
  defaultVerifiedUserSelection,
  fetchVerifiedUser,
} from '../../users/repositories/verified-users.repository.ts'
import { reconcileSimulationsAfterLogin } from '../../users/services/reconcile-simulations-after-login.service.ts'
import { syncUserData } from '../../users/services/sync-user-data.service.ts'
import type {
  createAddOrUpdateContactAfterLogin,
  createSendWelcomeEmail,
} from '../emails/auth-emails.ts'
import type { LoginError } from '../errors/login.error.ts'
import { InvalidVerificationCodeError } from '../errors/login.error.ts'
import {
  claimVerificationCode,
  findVerificationCode,
  invalidateVerificationCode,
  type UserVerificationCode,
} from '../repositories/verification-codes.repository.ts'
import type { LoginDto } from '../schemas/verification-codes.schema.ts'

type SendWelcomeEmail = ReturnType<typeof createSendWelcomeEmail>
type AddOrUpdateContactAfterLogin = ReturnType<
  typeof createAddOrUpdateContactAfterLogin
>

/** The verified user as the login flow selects and returns it. */
type LoginUser = Prisma.VerifiedUserGetPayload<{
  select: {
    id: true
    name: true
    email: true
    position: true
    telephone: true
    optedInForCommunications: true
    createdAt: true
    updatedAt: true
  }
}>

type LoginResult = {
  user: LoginUser
  mode: VerificationCodeMode
}

/**
 * Looks up a valid (non-expired) verification code issued for the given
 * usage. A lookup miss is the expected invalid-code signal: it is returned as
 * a domain failure, never thrown - no diagnosis (see the migration tickets,
 * decision 3).
 */
export const verifyCode = async (
  verificationCode: Pick<VerificationCode, 'email' | 'code' | 'usage'>,
  { session }: { session?: Transaction } = {}
): Promise<Result<UserVerificationCode, InvalidVerificationCodeError>> => {
  try {
    // A single read opens no transaction of its own: it joins the caller's
    // transaction when there is one, and reads on the client otherwise.
    const found = await findVerificationCode(verificationCode, {
      session: session ?? prisma,
    })

    return success(found)
  } catch (e) {
    if (isPrismaErrorNotFound(e)) {
      return failure(new InvalidVerificationCodeError())
    }

    throw e
  }
}

export { invalidateVerificationCode }

/**
 * Returns the verified account that already owns `userId`, unless it is the
 * account identified by `email`.
 *
 * `VerifiedUser.id` is not unique in the schema - only `email` is the primary
 * key - so nothing in the database stops two accounts from sharing a userId.
 * The application enforces the "one session userId = one account" invariant
 * here, at every account entry point, by refusing to let an id belong to two
 * verified accounts.
 */
const findOtherVerifiedAccountWithUserId = (
  { userId, email }: { userId: string; email: string },
  { session }: { session: Transaction }
) =>
  session.verifiedUser.findFirst({
    where: { id: userId, NOT: { email } },
    select: { email: true },
  })

const createAccountOrSignin = async ({
  loginDto,
  sessionUserId,
  verificationCode,
}: {
  loginDto: LoginDto
  sessionUserId?: string
  verificationCode: UserVerificationCode
}): Promise<
  Result<
    {
      user: LoginUser
      mode: VerificationCodeMode
      previousUserId: string | undefined
    },
    InvalidVerificationCodeError
  >
> =>
  transaction(
    async (
      session
    ): Promise<
      Result<
        {
          user: LoginUser
          mode: VerificationCodeMode
          previousUserId: string | undefined
        },
        InvalidVerificationCodeError
      >
    > => {
      // Single-use by construction, on both branches: the code is claimed
      // atomically, inside the transaction, before the sign-in/sign-up
      // branch runs. A replayed code is already expired here, and a
      // concurrent request racing on the same code loses the claim
      // (count !== 1) however it interleaves with this one - there is no
      // read-then-write gap to exploit. This is the authoritative check:
      // the earlier verifyCode lookup outside the transaction is only a
      // fast-fail.
      const claimed = await claimVerificationCode(
        { id: verificationCode.id, usage: VerificationCodeUsage.login },
        { session }
      )
      if (!claimed) {
        return failure(new InvalidVerificationCodeError())
      }

      // Try SignIn first
      const existingUser = await fetchVerifiedUser(
        {
          email: loginDto.email,
          select: defaultVerifiedUserSelection,
        },
        { session }
      )

      if (existingUser) {
        // SignIn: the existing account's own id wins - never generate a fresh
        // one. Reconcile the session's data (previousUserId) into this account
        // only when that id is still free: if it already belongs to another
        // verified account, reconciling would move that other account's data
        // over and delete its user row.
        const sessionOwnedByOtherAccount =
          sessionUserId &&
          sessionUserId !== existingUser.id &&
          (await findOtherVerifiedAccountWithUserId(
            { userId: sessionUserId, email: loginDto.email },
            { session }
          ))

        return success({
          user: existingUser,
          mode: VerificationCodeMode.signIn,
          previousUserId: sessionOwnedByOtherAccount
            ? undefined
            : sessionUserId,
        })
      }

      // SignUp: reuse the session userId as the account id only when it is
      // still a free anonymous identity - the anonymous user row is then
      // updated in place, keeping the user's data attached. When it already
      // belongs to another verified account (typically signing up a new email
      // while authenticated as another account), start a fresh identity so one
      // id never maps to several accounts.
      const conflict = sessionUserId
        ? await findOtherVerifiedAccountWithUserId(
            { userId: sessionUserId, email: loginDto.email },
            { session }
          )
        : null

      const newUserId =
        conflict || !sessionUserId ? randomUUID() : sessionUserId

      const { user: newUser } = await createOrUpdateVerifiedUser(
        {
          id: { id: newUserId, email: loginDto.email },
          user: loginDto,
          select: defaultVerifiedUserSelection,
        },
        { session }
      )

      return success({
        user: newUser,
        mode: VerificationCodeMode.signUp,
        previousUserId: sessionUserId,
      })
    }
  )

interface LoginDependencies {
  logger: Logger
  captureException: CaptureException
  /** Welcome email factory from auth-emails (sign-up only side effect). */
  sendWelcomeEmail: SendWelcomeEmail
  /** Brevo contact refresh factory from auth-emails (every login). */
  addOrUpdateContactAfterLogin: AddOrUpdateContactAfterLogin
  /** Public origin the welcome email's dashboard link points to. */
  origin: string
  /** Runs the post-login side effects outside of the request lifecycle. */
  backgroundTaskRunner: BackgroundTaskRunner
}

export function createLogin({
  logger,
  captureException,
  sendWelcomeEmail,
  addOrUpdateContactAfterLogin,
  origin,
  backgroundTaskRunner,
}: LoginDependencies) {
  return async function login({
    loginDto,
    locale,
    sessionUserId,
  }: {
    loginDto: LoginDto
    locale: ISOSupportedLanguage
    /**
     * The current session's userId, derived from the signed session payload.
     * The service relies on it to enforce the "one session userId = one
     * account" invariant.
     */
    sessionUserId?: string
  }): Promise<Result<LoginResult, LoginError>> {
    const verificationCode = await verifyCode({
      ...loginDto,
      usage: VerificationCodeUsage.login,
    })
    if (!verificationCode.success) {
      return failure(verificationCode.error)
    }

    const account = await createAccountOrSignin({
      loginDto,
      sessionUserId,
      verificationCode: verificationCode.data,
    })
    // The atomic claim inside the transaction is the authoritative check: a
    // code that expired between the lookup and the claim - replayed or
    // raced - fails here with the same domain error as an invalid code.
    if (!account.success) {
      return failure(account.error)
    }

    const { user, mode, previousUserId } = account.data

    if (mode === VerificationCodeMode.signUp) {
      // sync-user-data-after-account-created handler: the legacy
      // anonymous-user merge runs on every account creation.
      await syncUserData({ user, verified: true })
    }

    if (
      mode === VerificationCodeMode.signIn &&
      previousUserId &&
      previousUserId !== user.id
    ) {
      // reconcile-simulations-after-login handler: the anonymous session's
      // data is reconciled into the signed-in account, unless the session
      // userId is the verified user's own id or there is no session userId to
      // reconcile from.
      await reconcileSimulationsAfterLogin({ user, previousUserId })
    }

    // update-brevo-contact handler: every login refreshes the Brevo contact.
    // A failing email must never fail the login, and the runner only
    // schedules - error handling lives here.
    backgroundTaskRunner(async () => {
      try {
        await addOrUpdateContactAfterLogin({
          email: user.email,
          userId: user.id,
        })
      } catch (error) {
        captureException(error)
        logger.error('Failed to run side effect', { error })
      }
    })

    // send-welcome-email handler: the welcome email is a sign-up only side
    // effect.
    if (mode === VerificationCodeMode.signUp) {
      backgroundTaskRunner(async () => {
        try {
          await sendWelcomeEmail({ locale, email: user.email, origin })
        } catch (error) {
          captureException(error)
          logger.error('Failed to run side effect', { error })
        }
      })
    }

    return success({ user, mode })
  }
}
