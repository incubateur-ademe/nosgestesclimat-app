'use server'

import { redirect, unauthorized } from 'next/navigation'
import { getUserSession, type AuthUser } from './get-user-session'

/**
 * Requires an authenticated user session.
 *
 * @param {Object} options - The options object.
 * @param {string} [options.redirect] - Optional URL to redirect to if the user is not authenticated.
 * Instead of throwing an unauthorized error, the user will be redirected to this URL.
 *
 * @throws {Error} Throws a Next.js error if the user is not authenticated by calling `unauthorized()`
 * when no redirect URL is provided.
 *
 * @returns {Promise<AuthUser>} A promise that resolves to the authenticated user object.
 */
export async function requireAuthUser({
  redirect: redirectUrl,
}: {
  redirect?: string
} = {}): Promise<AuthUser> {
  const user = await getUserSession()
  if (user?.isAuth) {
    return user
  }
  if (redirectUrl) {
    redirect(redirectUrl)
  } else {
    unauthorized()
  }
}
