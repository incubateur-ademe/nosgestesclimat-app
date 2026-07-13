'use server'

import { USER_URL } from '@/constants/urls/main'
import { ForbiddenError, UnauthorizedError } from '@/helpers/server/error'
import { fetchServer } from '@/helpers/server/fetchServer'
import { revokeAllSessions } from '@nosgestesclimat/core/features/auth/services/revoke-all-sessions.service'
import type { AgeRange } from '@nosgestesclimat/core/features/users/types/age-range'
import { createAppSession } from '../auth/create-app-session'
import { getUserSession } from '../auth/get-user-session'

export const updateUser = async ({
  email,
  name,
  ageRange,
  code,
}: {
  email?: string
  name?: string
  ageRange?: AgeRange
  code?: string
}) => {
  const session = await getUserSession()
  if (!session) {
    throw new UnauthorizedError()
  }

  if (!session.isAuth) {
    throw new ForbiddenError()
  }

  const url = new URL(USER_URL)
  if (code) url.searchParams.set('code', code)

  const data = await fetchServer<{ id: string }>(url.toString(), {
    method: 'PUT',
    body: { email, name, ageRange },
  })
  if (email !== undefined && email !== session.email) {
    await revokeAllSessions(session.id)
    await createAppSession(session.id, email)
  }
  return { ...data, userId: data.id }
}
