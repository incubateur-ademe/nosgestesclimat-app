'use server'

import { deleteSessionCookies } from '@/helpers/server/cookie/auth.cookie'
import i18nConfig from '@/i18nConfig'
import { revokeAllSessions } from '@nosgestesclimat/core/features/auth/services/revoke-all-sessions.service'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
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

  // The i18n middleware rewrites the locale-less URL, so route tags are keyed
  // on /fr, /en, ...
  for (const locale of i18nConfig.locales) {
    revalidatePath(`/${locale}`, 'layout')
  }
}
