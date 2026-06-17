import { middlewareFeatureFlags } from '@/helpers/server/proxy/feature-flags'
import { middlewareAuth } from '@/helpers/server/proxy/auth/process-auth'
import { middlewareRegion } from '@/helpers/server/proxy/region'
import { type NextRequest, NextResponse } from 'next/server'
import { i18nRouter } from 'next-i18n-router'
import i18nConfig from '@/i18nConfig'

const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY ?? ''

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const isApiRoute = request.nextUrl.pathname.startsWith('/api/server')

  // Phase 1 — Interceptors
  if (!isApiRoute) {
    const ff = middlewareFeatureFlags(request)
    if (ff.redirect) return ff.redirect
  }

  const auth = await middlewareAuth(request)
  if (auth.redirect && !isApiRoute) return auth.redirect

  const region = middlewareRegion(request)

  // Phase 2 — Routing
  if (isApiRoute) {
    request.headers.set('x-internal-key', INTERNAL_API_KEY)
  }
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
    {
      source:
        '/((?!_next/static|_next/image|favicon.ico|favicon.png|images|manifest.webmanifest|scripts|demos|misc|videos|robots.txt|datashare).*)',
    },
  ],
}
