import i18nConfig, { NEXT_LOCALE_COOKIE_NAME } from '@/i18nConfig'
import { cookies } from 'next/headers'
import type { NextRequest, ProxyConfig } from 'next/server'
import { userMiddleware } from './helpers/server/dal/middleware'
import { featureFlagMiddleware } from './middlewares/featureFlagMiddleware'
import i18nMiddleware from './middlewares/i18nMiddleware'

export async function proxy(request: NextRequest) {
  const response = await featureFlagMiddleware(request, (req) =>
    userMiddleware(req, i18nMiddleware)
  )

  // Sync NEXT_LOCALE cookie with the URL path locale (e.g. /en → en).
  // Uses cookies().set() — the same mechanism iron-session uses internally.
  const pathname = request.nextUrl.pathname
  const pathLocale = i18nConfig.locales.find(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (pathLocale) {
    const cookieStore = await cookies()

    cookieStore.set(
      NEXT_LOCALE_COOKIE_NAME,
      pathLocale,
      i18nConfig.cookieOptions ?? {}
    )
  }

  return response
}

export const config: ProxyConfig = {
  matcher: [
    {
      source:
        '/((?!api|_next/static|_next/image|favicon.ico|favicon.png|images|manifest.webmanifest|scripts|demos|misc|videos|robots.txt|datashare).*)',
    },
  ],
}
