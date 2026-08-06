'use server'

import {
  InvalidCodeError,
  RateLimitedError,
  UnknownCodeError,
  type CodeError,
} from '@/components/authentication/errors'
import { AUTHENTICATION_URL } from '@/constants/urls/main'
import {
  ForbiddenError,
  TooManyRequestsError,
  UnauthorizedError,
} from '@/helpers/server/error'
import { fetchServer } from '@/helpers/server/fetchServer'
import { revokeAllSessions } from '@nosgestesclimat/core/features/auth/services/revoke-all-sessions.service'
import { failure, success, type Result } from '@nosgestesclimat/core/lib/result'
import { revalidatePath } from 'next/cache'
import { v4 } from 'uuid'
import { createAppSession } from './create-app-session'
import { getUserSession } from './get-user-session'

export const login = async ({
  email,
  code,
  locale,
}: {
  email: string
  code: string
  locale?: string
}): Promise<Result<{ userId: string; id: string }, CodeError>> => {
  try {
    const session = await getUserSession()
    // Reusing the current session's userId for a *different* account is what
    // ends up attaching one id to several verified accounts (the server only
    // rejects it on signin, after the damage is done on signup). Starting a
    // fresh identity here keeps the 1 session id = 1 account invariant.
    const isSwitchingAccount =
      session?.isAuth === true && session.email !== email
    const params = locale ? `?locale=${locale}` : ''
    const data = await fetchServer<{ id: string }>(
      `${AUTHENTICATION_URL}/login${params}`,
      {
        method: 'POST',
        body: {
          email,
          code,
          userId: isSwitchingAccount ? v4() : (session?.id ?? v4()),
        },
      }
    )

    if (session?.id) {
      await revokeAllSessions(session.id)
    }
    await createAppSession(data.id, email)

    revalidatePath('/', 'layout')

    return success({ ...data, userId: data.id })
  } catch (error) {
    if (error instanceof UnauthorizedError)
      return failure(new InvalidCodeError())
    if (error instanceof ForbiddenError) return failure(new InvalidCodeError())
    if (error instanceof TooManyRequestsError)
      return failure(new RateLimitedError())
    return failure(new UnknownCodeError())
  }
}
