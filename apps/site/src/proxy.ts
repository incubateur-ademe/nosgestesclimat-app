import { middlewareAuth } from '@/helpers/server/proxy/middleware-auth'
import { middlewareFeatureFlags } from '@/helpers/server/proxy/middleware-feature-flags'
import { middlewareRegion } from '@/helpers/server/proxy/middleware-region'
import i18nConfig from '@/i18nConfig'
import { i18nRouter } from 'next-i18n-router'
import type { NextRequest , NextResponse } from 'next/server'

export async function proxy(request: NextRequest): Promise<NextResponse> {
  // Phase 1 — Interceptors
  const ff = middlewareFeatureFlags(request)
  if (ff.redirect) return ff.redirect

  const auth = await middlewareAuth(request)
  if (auth.redirect) return auth.redirect

  const region = await middlewareRegion(request)

  // Phase 2 — Routing
  const response = i18nRouter(request, i18nConfig)

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
     */
    {
      source:
        '/((?!_next/static|_next/image|favicon.ico|favicon.png|images|manifest.webmanifest|scripts|demos|misc|videos|robots.txt|datashare).*)',
    },
  ],
}
