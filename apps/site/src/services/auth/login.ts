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
import { err, ok, type Result } from '@/utils/result'
import { revokeAllSessions } from '@nosgestesclimat/core/features/auth/services/revoke-all-sessions.service'
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
    const params = locale ? `?locale=${locale}` : ''
    const data = await fetchServer<{ id: string }>(
      `${AUTHENTICATION_URL}/login${params}`,
      {
        method: 'POST',
        body: { email, code, userId: session?.id ?? v4() },
      }
    )

    if (session?.id) {
      await revokeAllSessions(session.id)
    }
    await createAppSession(data.id, email)

    revalidatePath('/', 'layout')

    return ok({ ...data, userId: data.id })
  } catch (error) {
    if (error instanceof UnauthorizedError) return err(new InvalidCodeError())
    if (error instanceof ForbiddenError) return err(new InvalidCodeError())
    if (error instanceof TooManyRequestsError)
      return err(new RateLimitedError())
    return err(new UnknownCodeError())
  }
}
