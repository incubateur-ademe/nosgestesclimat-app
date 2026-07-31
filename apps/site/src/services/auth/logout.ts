'use server'

import { deleteSessionCookies } from '@/helpers/server/cookie/auth.cookie'
import { revokeAllSessions } from '@nosgestesclimat/core/features/auth/services/revoke-all-sessions.service'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getCookieOptions } from '../../helpers/server/cookie/helpers'
import { getUserSession } from './get-user-session'

export async function logout(): Promise<void> {
  const cookieStore = await cookies()
  const session = await getUserSession()
  if (session) {
    await revokeAllSessions(session.id)
  }
  for (const cookie of deleteSessionCookies()) {
    cookieStore.delete({ name: cookie.name, ...cookie.options })
  }

  // Legacy Express-issued auth cookie. Only cleared on an explicit logout —
  // middlewareMigrateLegacySessions otherwise uses it to transparently
  // re-issue a session, which is desirable for the token-rotation-failure
  // paths in auth.middleware.ts but must NOT happen after the user logs out.
  if (process.env.SERVER_AUTH_COOKIE_NAME) {
    cookieStore.delete({
      name: process.env.SERVER_AUTH_COOKIE_NAME,
      ...getCookieOptions(),
      maxAge: 0,
    })
  }

  revalidatePath('/', 'layout')
  redirect('/')
}
