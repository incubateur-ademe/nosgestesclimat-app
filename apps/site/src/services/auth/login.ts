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
    const params = locale ? `?locale=${locale}` : ''
    const data = await fetchServer<{ id: string }>(
      `${AUTHENTICATION_URL}/login${params}`,
      {
        method: 'POST',
        // The current session's userId is forwarded to the server as the
        // `x-user-id` header by `fetchServer`: the server is the one deciding
        // which userId to attach to the account (reusing the session's when
        // free, generating a fresh one when switching accounts), so the
        // "one session id = one account" invariant is enforced there.
        body: {
          email,
          code,
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
