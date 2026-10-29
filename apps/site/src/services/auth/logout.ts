'use server'

import { deleteSessionCookies } from '@/helpers/server/cookie/auth.cookie'
import { revokeAllSessions } from '@nosgestesclimat/core/features/auth/services/revoke-all-sessions.service'
import { cookies } from 'next/headers'
import { revalidateBasePathForLocales } from './_helpers/revalidate-base-path-for-locales'
import { getUserSession } from './get-user-session'

/**
 * Logs the current user out (server-side): revokes every backend session,
 * deletes the session cookies and purges the server-side route cache.
 *
 * It deliberately does **not** call {@link redirect}: the client caller owns the
 * navigation and must do a full-document navigation (e.g. `window.location`)
 * after this resolves. A server-action `redirect()` is turned into a soft RSC
 * navigation that replays the per-session prefetched App Shell (header still
 * showing the logged-in state) from the client Router Cache without re-fetching
 * from the server.
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
