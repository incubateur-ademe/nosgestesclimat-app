'use server'

import { SESSION_COOKIE } from '@/helpers/server/cookie/auth.cookie'
import { cookies } from 'next/headers'

/**
 * Returns whether the session cookie is present on the current request.
 *
 * Called right after a successful login: if the browser did not persist the
 * cookies (partitioning, third-party context, iframe), the just-authenticated
 * user is anonymous again on the next screen — a failure mode that leaves no
 * trace today.
 */
export async function hasSessionCookie(): Promise<boolean> {
  const store = await cookies()
  return store.has(SESSION_COOKIE)
}
