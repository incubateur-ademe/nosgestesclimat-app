import { createSession } from '@nosgestesclimat/core/features/auth/services/create-session.service'
import type { BrowserContext } from '@playwright/test'
import { REFRESH_COOKIE_NAME, SESSION_COOKIE_NAME } from '../constants'

/**
 * Signs the browser in as a seeded user, without going through the
 * verification code flow: the session is issued by core, exactly as the site
 * does on login, and installed as the site's auth cookies.
 *
 * Local suite only: it needs the e2e database and the site's
 * SESSION_ENCRYPTION_KEY.
 */
export async function signIn(
  context: BrowserContext,
  { id, email }: { id: string; email?: string | null }
) {
  const { accessToken, refreshToken } = await createSession(
    id,
    email ?? undefined
  )

  const url = process.env.NEXT_PUBLIC_SITE_URL!
  await context.addCookies(
    [
      { name: SESSION_COOKIE_NAME, value: accessToken },
      { name: REFRESH_COOKIE_NAME, value: refreshToken },
    ].map((cookie) => ({
      ...cookie,
      url,
      httpOnly: true,
      sameSite: 'Lax' as const,
    }))
  )
}
