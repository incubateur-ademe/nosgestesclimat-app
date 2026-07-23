'use server'

import { AUTHENTICATION_URL } from '@/constants/urls/main'
import {
  ForbiddenError,
  TooManyRequestsError,
  UnauthorizedError,
} from '@/helpers/server/error'
import { fetchServer } from '@/helpers/server/fetchServer'
import type { CodeError } from '@/types/auth-errors'
import { revokeAllSessions } from '@nosgestesclimat/core/features/auth/services/revoke-all-sessions.service'
import { err, ok, type Result } from 'neverthrow'
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
    if (error instanceof UnauthorizedError) return err({ _tag: 'invalid' })
    if (error instanceof ForbiddenError) return err({ _tag: 'invalid' })
    if (error instanceof TooManyRequestsError)
      return err({ _tag: 'rate_limited' })
    return err({ _tag: 'unknown' })
  }
}
