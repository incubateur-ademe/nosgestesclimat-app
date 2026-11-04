'use server'

import { deleteSessionCookies } from '@/helpers/server/cookie/auth.cookie'
import { revokeAllSessions } from '@nosgestesclimat/core/features/auth/services/revoke-all-sessions.service'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidateBasePathForLocales } from './_helpers/revalidate-base-path-for-locales'
import { getUserSession } from './get-user-session'

/**
 * Revokes every backend session, deletes the session cookies, purges the
 * server-side route cache and navigates home. The redirect stays here: the
 * router must consume the revalidated tree, which a client-side reload aborts.
 */
export async function logout(): Promise<void> {
  const cookieStore = await cookies()
  const session = await getUserSession()
  if (session) {
    await revokeAllSessions(session.id)
  }
  for (const cookie of deleteSessionCookies()) {
    cookieStore.delete({ name: cookie.name, ...cookie.options })
  }

  revalidateBasePathForLocales()
  redirect('/')
}
