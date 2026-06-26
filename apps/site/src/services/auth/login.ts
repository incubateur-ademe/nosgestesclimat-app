'use server'

import { AUTHENTICATION_URL } from '@/constants/urls/main'
import { fetchServer } from '@/helpers/server/fetchServer'
import { revokeAllSessions } from '@nosgestesclimat/core/features/auth/services/revoke-all-sessions.service'
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
}) => {
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
  return { ...data, userId: data.id }
}
