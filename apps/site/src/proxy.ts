import { middlewareAuth } from '@/helpers/server/proxy/auth.middleware'
import { middlewareFeatureFlags } from '@/helpers/server/proxy/feature-flags.middleware'
import { middlewareIdentity } from '@/helpers/server/proxy/identity.middleware'
import { middlewareMigrateLegacySessions } from '@/helpers/server/proxy/migrate-legacy-sessions.middleware'
import { middlewareRegion } from '@/helpers/server/proxy/region.middleware'
import i18nConfig from '@/i18nConfig'
import { i18nRouter } from 'next-i18n-router'
import { type NextRequest, NextResponse } from 'next/server'

export async function proxy(request: NextRequest): Promise<NextResponse> {
  // Next forwards a server action to the worker holding it through a
  // self-fetch stamped `x-action-forwarded`, which comes back through this
  // proxy. i18nRouter would rewrite its no-locale URL (prepending the default
  // locale), which changes the page seen by `selectWorkerForForwarding` and
  // makes it re-forward indefinitely → "failed to forward action response"
  // storm. Forward-fetches target a specific worker page on purpose and must
  // not be i18n-rewritten, so pass them through untouched.
  //
  // They still carry the headers of the request that forwarded them — Next
  // copies them all, `x-session` included — and the trace they open holds the
  // action's own work: identify them like the rest, or what they write stays
  // anonymous.
  if (request.headers.get('x-action-forwarded')) {
    middlewareIdentity(request)

    return NextResponse.next()
  }

  // Phase 1 — Interceptors
  const ff = middlewareFeatureFlags(request)
  if (ff.redirect) return ff.redirect

  const migrate = await middlewareMigrateLegacySessions(request)

  const auth = await middlewareAuth(request)
  if (auth.redirect) return auth.redirect

  // Reads the `x-session` header auth just set. Reads only: no redirect,
  // no cookies.
  middlewareIdentity(request)

  const region = await middlewareRegion(request)

  // Phase 2 — Routing
  const response = i18nRouter(request, i18nConfig)

  // Phase 3 — Apply cookies
  for (const cookie of [
    ...migrate.cookies,
    ...auth.cookies,
    ...region.cookies,
  ]) {
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
     * - _static (CMS assets proxied to S3, cf. next.config.ts rewrites)
     * - favicon.ico / favicon.png (favicon files)
     * - images (public images directory)
     * - manifest.webmanifest (PWA manifest)
     * - scripts (public scripts directory)
     * - demos (public demos directory)
     * - misc (public misc directory)
     * - videos (public videos directory)
     * - robots.txt (robots file)
     * - sitemap.xml (root sitemap file)
     * - datashare (iframe datashare modal)
     * - app-crash (error page outside i18n, served by nginx on upstream outage)
     */
    {
      source:
        '/((?!_next/static|_next/image|_static|favicon.ico|favicon.png|images|manifest.webmanifest|scripts|demos|misc|videos|robots.txt|sitemap.xml|datashare|app-crash).*)',
    },
  ],
}
