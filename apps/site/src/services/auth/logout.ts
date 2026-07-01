'use server'

import {
  getCookieOptions,
  REFRESH_COOKIE,
  SESSION_COOKIE,
} from '@/helpers/server/cookies'
import { revokeAllSessions } from '@nosgestesclimat/core/features/auth/services/revoke-all-sessions.service'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getUserSession } from './get-user-session'

export async function logout(): Promise<void> {
  const cookieStore = await cookies()
  const options = getCookieOptions()
  const session = await getUserSession()
  if (session) {
    await revokeAllSessions(session.id)
  }

  cookieStore.delete({ name: SESSION_COOKIE, ...options })
  cookieStore.delete({ name: REFRESH_COOKIE, ...options })

  revalidatePath('/', 'layout')
  redirect('/')
}
