'use server'

import { deleteSessionCookies } from '@/helpers/server/cookie/auth.cookie'
import { revokeAllSessions } from '@nosgestesclimat/core/features/auth/services/revoke-all-sessions.service'
import { cookies } from 'next/headers'
import { revalidateBasePathForLocales } from './_helpers/revalidate-base-path-for-locales'
import { getUserSession } from './get-user-session'

/**
 * Revokes every backend session, deletes the session cookies and purges the
 * server-side route cache. The caller owns the navigation: a server-action
 * `redirect()` replays the prefetched App Shell, header still logged in.
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
}
