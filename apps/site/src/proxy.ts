import { middlewareFeatureFlags } from '@/helpers/server/proxy/feature-flags'
import { middlewareAuth } from '@/helpers/server/proxy/auth/process-auth'
import { middlewareRegion } from '@/helpers/server/proxy/region'
import { type NextRequest, NextResponse } from 'next/server'
import { i18nRouter } from 'next-i18n-router'
import i18nConfig from '@/i18nConfig'

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const isApiRoute = request.nextUrl.pathname.startsWith('/api/server')

  // Phase 1 — Interceptors
  if (!isApiRoute) {
    const ff = middlewareFeatureFlags(request)
    if (ff.redirect) return ff.redirect
  }

  const auth = await middlewareAuth(request)
  if (auth.redirect && !isApiRoute) return auth.redirect

  const region = await middlewareRegion(request)

  // Phase 2 — Routing
  const response = isApiRoute
    ? NextResponse.next()
    : i18nRouter(request, i18nConfig)

  // Phase 3 — Apply cookies
  for (const cookie of [...auth.cookies, ...region.cookies]) {
    response.cookies.set(cookie.name, cookie.value, cookie.options)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico / favicon.png (favicon files)
     * - images (public images directory)
     * - manifest.webmanifest (PWA manifest)
     * - scripts (public scripts directory)
     * - demos (public demos directory)
     * - misc (public misc directory)
     * - videos (public videos directory)
     * - robots.txt (robots file)
     * - datashare (iframe datashare modal)
     *
     * Note: /api/server is intentionally NOT excluded — the proxy
     * handles auth and region cookies for those routes.
     */
    {
      source:
        '/((?!_next/static|_next/image|favicon.ico|favicon.png|images|manifest.webmanifest|scripts|demos|misc|videos|robots.txt|datashare).*)',
    },
  ],
}
